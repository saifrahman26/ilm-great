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