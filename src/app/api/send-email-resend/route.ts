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

        // Use Resend API with onboarding domain (works immediately)
        const RESEND_API_KEY = 're_4KmBBVGf_4yKWJkxvNxTzYvqbEWq2TNBX' // This is a test key that works with onboarding domain

        console.log('📧 Sending email via Resend onboarding domain...')

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'LoyalLink <onboarding@resend.dev>',
                to: [email],
                subject: subject || 'LoyalLink Notification',
                html: message,
                text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            })
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Email sent successfully via Resend!')
            return NextResponse.json({
                success: true,
                result,
                message: 'Email sent successfully via Resend',
                emailId: result.id
            })
        } else {
            console.error('❌ Resend API error:', result)
            return NextResponse.json(
                {
                    error: 'Failed to send email via Resend',
                    details: result,
                    status: response.status
                },
                { status: response.status }
            )
        }

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