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

        // Check if API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not configured')
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            )
        }

        // Send email using Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'LoyalLink <onboarding@resend.dev>', // Using Resend's verified test domain
                to: process.env.NODE_ENV === 'development' ? 'warriorsaifdurer@gmail.com' : email,
                subject: process.env.NODE_ENV === 'development'
                    ? `[TEST] ${subject || 'Loyalty Program Update'} - Originally for: ${email}`
                    : (subject || 'Loyalty Program Update'),
                html: process.env.NODE_ENV === 'development'
                    ? `
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
                            <strong>🧪 TEST MODE:</strong> This email was originally intended for: <strong>${email}</strong>
                        </div>
                        ${htmlContent}
                    `
                    : htmlContent,
                text: process.env.NODE_ENV === 'development'
                    ? `[TEST MODE] Originally for: ${email}\n\n${message}`
                    : message,
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