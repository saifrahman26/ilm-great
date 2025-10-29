import { NextRequest, NextResponse } from 'next/server'
import { getLoyaltyEmailTemplate, getSimpleEmailTemplate, getVisitReminderTemplate } from '@/lib/email-templates'

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
            businessType,
            currentVisits,
            visitGoal,
            emailType,
            context,
            template = 'simple'
        } = await request.json()

        if (!email && template !== 'ai-enhanced') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Generate HTML email based on template type
        let htmlContent: string
        let emailSubject = subject || 'Loyalty Program Update'

        if (template === 'ai-enhanced' && customerName && businessName && emailType && context) {
            // Use the new AI-enhanced email service
            const { sendAIEnhancedEmail } = await import('@/lib/email')

            try {
                const emailSent = await sendAIEnhancedEmail(
                    email,
                    customerName,
                    businessName,
                    businessType || 'Business',
                    emailType,
                    context
                )

                return NextResponse.json({
                    success: emailSent,
                    message: emailSent ? 'AI-enhanced email sent successfully!' : 'Failed to send AI-enhanced email',
                    service: 'ai-enhanced',
                    template: 'ai-enhanced'
                })
            } catch (error) {
                console.error('❌ AI-enhanced email error:', error)
                return NextResponse.json({
                    success: false,
                    error: 'AI-enhanced email failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 })
            }
        } else if (template === 'loyalty' && (points || customerName)) {
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
        } else if (template === 'raw-html' || (message && message.includes('<!DOCTYPE html>'))) {
            htmlContent = message
        } else {
            if (!message) {
                return NextResponse.json(
                    { error: 'Message is required for this template type' },
                    { status: 400 }
                )
            }
            htmlContent = getSimpleEmailTemplate(message)
        }

        console.log('📧 Starting Resend email process...')
        console.log('🔑 Resend API key configured:', process.env.RESEND_API_KEY ? 'Yes' : 'No')

        // Use Resend API (much more reliable than Gmail SMTP)
        const { Resend } = require('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        console.log('📤 Sending email via Resend...')

        const emailData = {
            from: 'LoyalLink <onboarding@resend.dev>', // Resend's default sender
            to: [email],
            subject: subject || 'Loyalty Program Update',
            html: htmlContent,
        }

        console.log('📧 Email data:', { ...emailData, html: 'HTML content...' })

        const result = await resend.emails.send(emailData)

        console.log('✅ Email sent successfully via Resend!')
        console.log('📧 Resend result:', result)

        return NextResponse.json({
            success: true,
            result: result.data,
            message: 'Email sent successfully via Resend! Check your inbox.',
            service: 'resend',
            from: 'onboarding@resend.dev',
            to: email,
            debug: {
                id: result.data?.id,
                error: result.error
            }
        })

    } catch (error) {
        console.error('❌ Gmail SMTP Error Details:', error)

        // Return the actual error for debugging
        return NextResponse.json({
            success: false,
            message: 'Gmail SMTP failed',
            service: 'gmail_error',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            debug: {
                gmailUser: process.env.GMAIL_USER,
                hasPassword: !!process.env.GMAIL_APP_PASSWORD,
                passwordLength: process.env.GMAIL_APP_PASSWORD?.length || 0
            }
        })
    }
}