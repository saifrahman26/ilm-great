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

        // Check if Brevo API key is configured
        if (!process.env.BREVO_API_KEY) {
            console.error('BREVO_API_KEY is not configured')
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            )
        }

        // Log API key info for debugging (without exposing the full key)
        console.log('🔑 Brevo API key configured, length:', process.env.BREVO_API_KEY.length)
        console.log('🔑 API key starts with:', process.env.BREVO_API_KEY.substring(0, 10) + '...')

        // Send email using Brevo API
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
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
                textContent: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
                tags: ['loyalty-program', 'automated']
            })
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Email sent successfully:', {
                id: result.id,
                to: email,
                subject: subject || 'Loyalty Program Update'
            })
            return NextResponse.json({
                success: true,
                result,
                message: 'Email sent successfully'
            })
        } else {
            console.error('❌ Resend API error:', {
                status: response.status,
                statusText: response.statusText,
                result,
                apiKey: process.env.RESEND_API_KEY ? 'Present' : 'Missing'
            })
            return NextResponse.json(
                {
                    error: 'Failed to send email',
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