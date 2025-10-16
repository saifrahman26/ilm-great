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

        console.log('📧 Sending real email that will be delivered...')

        // Use Mailjet - reliable free tier with good delivery
        const MAILJET_API_KEY = process.env.MAILJET_API_KEY || 'your_mailjet_api_key'
        const MAILJET_SECRET = process.env.MAILJET_SECRET || 'your_mailjet_secret'

        const emailData = {
            Messages: [
                {
                    From: {
                        Email: 'noreply@loyallinkk.com',
                        Name: 'LoyalLink'
                    },
                    To: [
                        {
                            Email: email,
                            Name: customerName || 'Valued Customer'
                        }
                    ],
                    Subject: subject || 'LoyalLink Notification',
                    TextPart: message.replace(/<[^>]*>/g, ''),
                    HTMLPart: message
                }
            ]
        }

        // Try Mailjet
        try {
            const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET}`).toString('base64')}`
                },
                body: JSON.stringify(emailData)
            })

            const mailjetResult = await mailjetResponse.json()

            if (mailjetResponse.ok) {
                console.log('✅ Email sent successfully via Mailjet!')
                return NextResponse.json({
                    success: true,
                    result: mailjetResult,
                    message: 'Email sent successfully via Mailjet - check your inbox!',
                    service: 'mailjet'
                })
            }
        } catch (mailjetError) {
            console.log('Mailjet failed, trying Postmark...')
        }

        // Fallback: Use Postmark (excellent delivery rates)
        try {
            const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Postmark-Server-Token': process.env.POSTMARK_TOKEN || 'your_postmark_token'
                },
                body: JSON.stringify({
                    From: 'noreply@loyallinkk.com',
                    To: email,
                    Subject: subject || 'LoyalLink Notification',
                    HtmlBody: message,
                    TextBody: message.replace(/<[^>]*>/g, ''),
                    MessageStream: 'outbound'
                })
            })

            const postmarkResult = await postmarkResponse.json()

            if (postmarkResponse.ok) {
                console.log('✅ Email sent successfully via Postmark!')
                return NextResponse.json({
                    success: true,
                    result: postmarkResult,
                    message: 'Email sent successfully via Postmark - check your inbox!',
                    service: 'postmark'
                })
            }
        } catch (postmarkError) {
            console.log('Postmark failed, using final solution...')
        }

        // Ultimate fallback: Use EmailJS (client-side email service)
        const emailjsData = {
            service_id: 'service_loyallink',
            template_id: 'template_loyallink',
            user_id: 'your_emailjs_user_id',
            template_params: {
                to_email: email,
                from_name: 'LoyalLink',
                subject: subject || 'LoyalLink Notification',
                message: message,
                customer_name: customerName || 'Valued Customer'
            }
        }

        const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailjsData)
        })

        if (emailjsResponse.ok) {
            console.log('✅ Email sent successfully via EmailJS!')
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully via EmailJS - check your inbox!',
                service: 'emailjs'
            })
        }

        // If everything fails, at least log it
        console.log('📧 All email services failed, logging for manual processing')

        return NextResponse.json({
            success: false,
            error: 'All email services failed',
            message: 'Unable to send email at this time',
            suggestion: 'Please try again later or contact support'
        }, { status: 500 })

    } catch (error) {
        console.error('❌ Error in email service:', error)
        return NextResponse.json(
            {
                error: 'Email service error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}