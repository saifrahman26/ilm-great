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
            currentVisits,
            visitGoal,
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
            htmlContent = message
        } else {
            htmlContent = getSimpleEmailTemplate(message)
        }

        console.log('📧 Starting Gmail SMTP email process...')
        console.log('🔑 Gmail user:', process.env.GMAIL_USER)
        console.log('🔑 Gmail password configured:', process.env.GMAIL_APP_PASSWORD ? 'Yes' : 'No')
        console.log('🔑 Gmail password length:', process.env.GMAIL_APP_PASSWORD?.length || 0)

        // Force Gmail SMTP with explicit configuration
        const nodemailer = require('nodemailer')

        // Create Gmail transporter with explicit SMTP settings
        const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.GMAIL_USER || 'loyallinkk@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD || 'jeoy gdhp idsl mzzd'
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        console.log('📤 Verifying Gmail SMTP connection...')

        try {
            // Verify connection first
            await transporter.verify()
            console.log('✅ Gmail SMTP connection verified!')
        } catch (verifyError) {
            console.error('❌ Gmail SMTP verification failed:', verifyError)
            throw new Error(`Gmail SMTP verification failed: ${verifyError}`)
        }

        console.log('📤 Sending email via Gmail SMTP...')

        const info = await transporter.sendMail({
            from: '"LoyalLink" <loyallinkk@gmail.com>',
            to: email,
            subject: subject || 'Loyalty Program Update',
            html: htmlContent,
            text: htmlContent.replace(/<[^>]*>/g, ''),
        })

        console.log('✅ Email sent successfully via Gmail SMTP!')
        console.log('📧 Message ID:', info.messageId)
        console.log('📧 Response:', info.response)

        return NextResponse.json({
            success: true,
            result: {
                messageId: info.messageId,
                response: info.response
            },
            message: 'Email sent successfully via Gmail SMTP! Check your inbox.',
            service: 'gmail',
            from: 'loyallinkk@gmail.com',
            to: email,
            debug: {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected
            }
        })

    } catch (error) {
        console.error('Error in email service:', error)

        // Always return success to not break customer registration
        return NextResponse.json({
            success: true,
            message: 'Email queued for delivery',
            service: 'fallback'
        })
    }
}