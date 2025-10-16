import { NextRequest, NextResponse } from 'next/server'
import { getLoyaltyEmailTemplate, getSimpleEmailTemplate, getVisitReminderTemplate, getRewardCompletionTemplate } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
    try {
        const {
            email,
            message,
            subject,
            customerName,
            points,
            totalPoints,
            businessName,
            currentVisits,
            visitGoal,
            rewardTitle,
            rewardDescription,
            visitsCompleted,
            template = 'simple'
        } = await request.json()

        if (!email || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            )
        }

        // Generate HTML email based on template type
        let htmlContent: string
        if (template === 'loyalty' && (points || customerName)) {
            htmlContent = getLoyaltyEmailTemplate({
                customerName,
                points,
                totalPoints,
                message,
                businessName
            })
        } else if (template === 'visit-reminder' && currentVisits !== undefined && visitGoal) {
            htmlContent = getVisitReminderTemplate({
                customerName,
                currentVisits,
                visitGoal,
                businessName,
                message
            })
        } else if (template === 'raw-html' || message.includes('<!DOCTYPE html>')) {
            // Use raw HTML if template is 'raw-html' or message contains HTML
            htmlContent = message
        } else {
            htmlContent = getSimpleEmailTemplate(message)
        }

        // Try Resend first (works immediately with onboarding domain)
        console.log('📧 Attempting to send email via Resend...')

        const RESEND_API_KEY = 're_4KmBBVGf_4yKWJkxvNxTzYvqbEWq2TNBX' // Test key for onboarding domain

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'LoyalLink <onboarding@resend.dev>',
                to: [email],
                subject: subject || 'Loyalty Program Update',
                html: htmlContent,
                text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            })
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Email sent successfully via Resend:', {
                id: result.id,
                to: email,
                subject: subject || 'Loyalty Program Update'
            })
            return NextResponse.json({
                success: true,
                result,
                message: 'Email sent successfully via Resend',
                service: 'resend'
            })
        } else {
            console.error('❌ Resend API error:', {
                status: response.status,
                statusText: response.statusText,
                result
            })

            // Fallback to Brevo if Resend fails
            if (process.env.BREVO_API_KEY) {
                console.log('🔄 Falling back to Brevo...')

                const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'api-key': process.env.BREVO_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sender: {
                            name: 'LoyalLink',
                            email: process.env.BREVO_SENDER_EMAIL || 'noreply@loyallink.com'
                        },
                        to: [
                            {
                                email: email,
                                name: customerName || 'Valued Customer'
                            }
                        ],
                        subject: subject || 'Loyalty Program Update',
                        htmlContent: htmlContent,
                        textContent: message.replace(/<[^>]*>/g, ''),
                        tags: ['loyalty-program', 'automated']
                    })
                })

                const brevoResult = await brevoResponse.json()

                if (brevoResponse.ok) {
                    console.log('✅ Email sent successfully via Brevo fallback')
                    return NextResponse.json({
                        success: true,
                        result: brevoResult,
                        message: 'Email sent successfully via Brevo (fallback)',
                        service: 'brevo'
                    })
                }
            }

            return NextResponse.json(
                {
                    error: 'Failed to send email via both Resend and Brevo',
                    details: result,
                    status: response.status,
                    statusText: response.statusText
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}