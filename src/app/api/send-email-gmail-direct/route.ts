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

        console.log('📧 Sending email via Gmail SMTP (no domain verification needed)...')

        const nodemailer = require('nodemailer')

        // Gmail SMTP configuration
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'loyallinkk@gmail.com',
                pass: 'your_gmail_app_password' // Gmail app password (not regular password)
            }
        })

        // Send email
        const info = await transporter.sendMail({
            from: '"LoyalLink" <loyallinkk@gmail.com>',
            to: email,
            subject: subject || 'LoyalLink Notification',
            html: message,
            text: message.replace(/<[^>]*>/g, ''),
        })

        console.log('✅ Email sent successfully via Gmail SMTP!')
        console.log('📧 Message ID:', info.messageId)

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully via Gmail SMTP! Check your inbox.',
            service: 'gmail',
            from: 'loyallinkk@gmail.com',
            to: email
        })

    } catch (error) {
        console.error('❌ Error sending email via Gmail:', error)

        // If Gmail fails, try a simple HTTP email service
        try {
            console.log('🔄 Trying HTTP email service fallback...')

            // Use FormSubmit.co - free email forwarding service
            const formData = new FormData()
            formData.append('_to', email)
            formData.append('_subject', subject || 'LoyalLink Notification')
            formData.append('_template', 'table')
            formData.append('_captcha', 'false')
            formData.append('message', message)
            formData.append('from', 'LoyalLink')
            formData.append('customer_name', customerName || 'Valued Customer')

            const response = await fetch('https://formsubmit.co/ajax/loyallinkk@gmail.com', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (response.ok && result.success) {
                console.log('✅ Email sent successfully via FormSubmit!')
                return NextResponse.json({
                    success: true,
                    result,
                    message: 'Email sent successfully via FormSubmit! Check your inbox.',
                    service: 'formsubmit'
                })
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError)
        }

        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error',
                suggestion: 'Please set up Gmail app password or try again later'
            },
            { status: 500 }
        )
    }
}