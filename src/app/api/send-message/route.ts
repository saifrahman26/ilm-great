import { NextRequest, NextResponse } from 'next/server'
import { getLoyaltyEmailTemplate, getSimpleEmailTemplate, getVisitReminderTemplate } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Log the incoming request for debugging
        console.log('🔍 Send-message request received:')
        console.log('📝 Request body keys:', Object.keys(body))
        console.log('📧 Email provided:', !!body.email)
        console.log('💬 Message provided:', !!body.message)
        console.log('🏷️ Template:', body.template)

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
        } = body

        if (!email && template !== 'ai-enhanced') {
            console.log('❌ Email validation failed - email required for template:', template)
            return NextResponse.json(
                {
                    error: 'Email is required',
                    template: template,
                    providedFields: Object.keys(body)
                },
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
        } else if (template === 'premium-reward' && customerName && businessName && context) {
            // Use the premium reward email service
            const { sendPremiumRewardEmail } = await import('@/lib/email')

            try {
                const emailSent = await sendPremiumRewardEmail(
                    email,
                    customerName,
                    businessName,
                    businessType || 'Business',
                    context
                )

                return NextResponse.json({
                    success: emailSent,
                    message: emailSent ? 'Premium reward email sent successfully!' : 'Failed to send premium reward email',
                    service: 'premium-reward',
                    template: 'premium-reward'
                })
            } catch (error) {
                console.error('❌ Premium reward email error:', error)
                return NextResponse.json({
                    success: false,
                    error: 'Premium reward email failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 })
            }
        } else if (template === 'inactive-customer' && customerName && businessName && context) {
            // Use the AI service to generate inactive customer email
            const { aiService } = await import('@/lib/ai')

            try {
                const aiResponse = await aiService.generateWinBackEmail({
                    businessName,
                    businessType: context.businessCategory || 'Business',
                    customerName,
                    visitCount: context.visitCount || 0,
                    visitGoal: context.visitGoal || 5,
                    rewardTitle: context.rewardTitle || 'Reward',
                    daysSinceLastVisit: context.daysSinceLastVisit || 30,
                    specialOffer: context.specialOffer || '20% off your next purchase'
                })

                if (!aiResponse.success || !aiResponse.content) {
                    throw new Error(aiResponse.error || 'Failed to generate AI content')
                }

                // Send the email using the basic email service
                const { sendEmail } = await import('@/lib/email')
                const subject = `We miss you at ${businessName}! Special offer inside 🎁`

                const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .offer-box { background: #f8f9ff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>We Miss You! 💙</h1>
                            <p>A special message from ${businessName}</p>
                        </div>
                        <div class="content">
                            <div style="white-space: pre-line; margin-bottom: 20px;">
                                ${aiResponse.content}
                            </div>
                            
                            <div class="offer-box">
                                <h3 style="color: #667eea; margin-top: 0;">🎁 Your Special Offer</h3>
                                <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">
                                    ${context.specialOffer}
                                </p>
                                <p style="font-size: 14px; color: #666;">
                                    Valid for your next visit!
                                </p>
                            </div>

                            <div style="text-align: center;">
                                <p><strong>Your Progress:</strong> ${context.visitCount} visits completed</p>
                                <p>Only ${Math.max(0, context.visitGoal - context.visitCount)} more visits until you earn: <strong>${context.rewardTitle}</strong></p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This email was sent because you're a valued customer of ${businessName}.</p>
                        </div>
                    </div>
                </body>
                </html>`

                const emailSent = await sendEmail(
                    email,
                    subject,
                    emailHtml,
                    businessName
                )

                return NextResponse.json({
                    success: emailSent,
                    message: emailSent ? 'Inactive customer email sent successfully!' : 'Failed to send inactive customer email',
                    service: 'inactive-customer',
                    template: 'inactive-customer',
                    aiMessage: aiResponse.content
                })
            } catch (error) {
                console.error('❌ Inactive customer email error:', error)
                return NextResponse.json({
                    success: false,
                    error: 'Inactive customer email failed',
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
                console.log('❌ Message validation failed - message required for template:', template)
                return NextResponse.json(
                    {
                        error: 'Message is required for this template type',
                        template: template,
                        providedFields: Object.keys(body)
                    },
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