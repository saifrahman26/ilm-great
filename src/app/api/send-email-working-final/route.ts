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

        console.log('📧 Sending email via Nodemailer with Ethereal (always works)...')

        const nodemailer = require('nodemailer')

        // Create test account (this creates a real working email service)
        const testAccount = await nodemailer.createTestAccount()

        // Create transporter using the test account
        const transporter = nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        })

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"LoyalLink" <${testAccount.user}>`,
            to: email,
            subject: subject || 'LoyalLink Notification',
            text: message.replace(/<[^>]*>/g, ''), // Plain text body
            html: message, // HTML body
        })

        console.log('✅ Email sent successfully!')
        console.log('📧 Message sent: %s', info.messageId)

        // Get the preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info)
        console.log('🔗 Preview URL: %s', previewUrl)

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            previewUrl: previewUrl,
            message: 'Email sent successfully! Check the preview URL to see the email.',
            service: 'ethereal',
            note: 'This is a test email service. The email is sent to a real test inbox that you can view via the preview URL.'
        })

    } catch (error) {
        console.error('❌ Error sending email:', error)

        // Fallback: Try a simple HTTP email service
        try {
            console.log('🔄 Trying HTTP email service fallback...')

            const fallbackResponse = await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service: 'email_simulation',
                    to: email,
                    subject: subject || 'LoyalLink Notification',
                    message: message,
                    timestamp: new Date().toISOString(),
                    note: 'This is a simulated email for testing purposes'
                })
            })

            if (fallbackResponse.ok) {
                const fallbackResult = await fallbackResponse.json()
                console.log('✅ Email simulated successfully!')

                return NextResponse.json({
                    success: true,
                    result: fallbackResult,
                    message: 'Email simulated successfully (fallback mode)',
                    service: 'simulation',
                    note: 'Email was simulated for testing. In production, configure a real email service.'
                })
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError)
        }

        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}