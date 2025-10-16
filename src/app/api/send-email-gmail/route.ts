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

        console.log('📧 Sending email via Gmail SMTP...')

        // Use Gmail SMTP with app password (works immediately)
        const nodemailer = require('nodemailer')

        // Create Gmail transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'loyallinkk@gmail.com', // Your Gmail address
                pass: 'your_gmail_app_password' // Gmail app password (not regular password)
            }
        })

        // Send email
        const info = await transporter.sendMail({
            from: `"LoyalLink" <loyallinkk@gmail.com>`,
            to: email,
            subject: subject || 'LoyalLink Notification',
            html: message,
            text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        })

        console.log('✅ Email sent successfully via Gmail!')
        console.log('📧 Message ID:', info.messageId)

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully via Gmail SMTP',
            service: 'gmail'
        })

    } catch (error) {
        console.error('❌ Error sending email via Gmail:', error)
        return NextResponse.json(
            {
                error: 'Failed to send email via Gmail',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}