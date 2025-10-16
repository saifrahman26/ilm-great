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

        console.log('📧 Sending email via Elastic Email...')

        // Elastic Email API (free tier: 100 emails/day)
        const ELASTIC_API_KEY = process.env.ELASTIC_API_KEY || 'your_elastic_api_key'

        const emailData = {
            apikey: ELASTIC_API_KEY,
            from: 'loyallinkk@gmail.com',
            fromName: 'LoyalLink',
            to: email,
            subject: subject || 'LoyalLink Notification',
            bodyHtml: message,
            bodyText: message.replace(/<[^>]*>/g, ''),
            isTransactional: true
        }

        const formData = new URLSearchParams()
        Object.entries(emailData).forEach(([key, value]) => {
            formData.append(key, String(value))
        })

        const response = await fetch('https://api.elasticemail.com/v2/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })

        const result = await response.text()

        if (response.ok && !result.includes('error')) {
            console.log('✅ Email sent successfully via Elastic Email!')
            return NextResponse.json({
                success: true,
                result: result,
                message: 'Email sent successfully via Elastic Email',
                service: 'elastic'
            })
        } else {
            console.error('❌ Elastic Email error:', result)
            return NextResponse.json(
                {
                    error: 'Failed to send email via Elastic Email',
                    details: result,
                    status: response.status
                },
                { status: response.status }
            )
        }

    } catch (error) {
        console.error('❌ Error sending email via Elastic Email:', error)
        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}