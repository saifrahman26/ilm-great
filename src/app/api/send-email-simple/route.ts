import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email, subject, message, customerName } = await request.json()

        if (!email || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            )
        }

        console.log('📧 Sending email via Nodemailer SMTP...')

        // Use a simple SMTP service that works without verification
        // We'll use Ethereal Email for testing (creates real test emails)
        const nodemailer = require('nodemailer')

        // Create test account (this creates a real test email account)
        const testAccount = await nodemailer.createTestAccount()

        // Create transporter using test account
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
            subject: subject || 'LoyalLink Notification',
            html: message,
            text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        })

        console.log('✅ Email sent successfully!')
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info),
            message: 'Email sent successfully (test mode)',
            note: 'This is a test email. Check the preview URL to see the email.'
        })

    } catch (error) {
        console.error('❌ Error sending email:', error)
        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}