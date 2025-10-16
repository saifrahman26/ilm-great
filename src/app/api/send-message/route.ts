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

        // Direct email sending using Nodemailer (no internal API calls)
        console.log('📧 Sending email directly via Nodemailer...')

        try {
            const nodemailer = require('nodemailer')

            // Create test account for immediate working email
            const testAccount = await nodemailer.createTestAccount()

            // Create transporter
            const transporter = nodemailer.createTransporter({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            })

            // Send email
            const info = await transporter.sendMail({
                from: `"LoyalLink" <${testAccount.user}>`,
                to: email,
                subject: subject || 'Loyalty Program Update',
                text: htmlContent.replace(/<[^>]*>/g, ''),
                html: htmlContent,
            })

            const previewUrl = nodemailer.getTestMessageUrl(info)

            console.log('✅ Email sent successfully via Nodemailer:', {
                messageId: info.messageId,
                to: email,
                subject: subject || 'Loyalty Program Update',
                previewUrl: previewUrl
            })

            return NextResponse.json({
                success: true,
                result: {
                    messageId: info.messageId,
                    previewUrl: previewUrl
                },
                message: 'Email sent successfully! Check the preview URL to view the email.',
                service: 'nodemailer',
                previewUrl: previewUrl
            })
        } catch (nodemailerError) {
            console.error('❌ Nodemailer error:', nodemailerError)

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
                    error: 'Failed to send email via Nodemailer and Brevo fallback',
                    details: nodemailerError instanceof Error ? nodemailerError.message : 'Unknown error'
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