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

        console.log('📧 Sending email via Mailgun...')

        // Mailgun sandbox domain (works immediately without verification)
        const MAILGUN_DOMAIN = 'sandbox-123.mailgun.org' // Replace with your sandbox domain
        const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key'

        const formData = new FormData()
        formData.append('from', 'LoyalLink <mailgun@sandbox-123.mailgun.org>')
        formData.append('to', email)
        formData.append('subject', subject || 'LoyalLink Notification')
        formData.append('html', message)
        formData.append('text', message.replace(/<[^>]*>/g, ''))

        const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`
            },
            body: formData
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Email sent successfully via Mailgun!')
            return NextResponse.json({
                success: true,
                result,
                message: 'Email sent successfully via Mailgun',
                service: 'mailgun'
            })
        } else {
            console.error('❌ Mailgun error:', result)
            return NextResponse.json(
                {
                    error: 'Failed to send email via Mailgun',
                    details: result,
                    status: response.status
                },
                { status: response.status }
            )
        }

    } catch (error) {
        console.error('❌ Error sending email via Mailgun:', error)
        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}