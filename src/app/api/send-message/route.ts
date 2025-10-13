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
                to: 'warriorsaifdurer@gmail.com', // Resend sandbox mode - can only send to verified email
                subject: `[LoyalLink] ${subject || 'Loyalty Program Update'} - For: ${email}`,
                html: `
                    <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
                        <strong>📧 SANDBOX MODE:</strong> This email was originally intended for: <strong>${email}</strong><br>
                        <small style="color: #666;">Resend is in sandbox mode - emails are redirected to the verified address for testing.</small>
                    </div>
                    ${htmlContent}
                `,
                text: `[SANDBOX MODE] Originally for: ${email}\n\n${message}`,
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