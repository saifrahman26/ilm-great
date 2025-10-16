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

        console.log('📧 Sending email via Web3Forms (free, no API key needed)...')

        // Web3Forms - completely free, no API key needed
        const formData = new FormData()
        formData.append('access_key', 'your_web3forms_access_key') // Get free key from web3forms.com
        formData.append('from_name', 'LoyalLink')
        formData.append('from_email', 'loyallinkk@gmail.com')
        formData.append('to_email', email)
        formData.append('subject', subject || 'LoyalLink Notification')
        formData.append('message', message)
        formData.append('customer_name', customerName || 'Valued Customer')

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })

        const result = await response.json()

        if (response.ok && result.success) {
            console.log('✅ Email sent successfully via Web3Forms!')
            return NextResponse.json({
                success: true,
                result,
                message: 'Email sent successfully via Web3Forms',
                service: 'web3forms'
            })
        } else {
            console.error('❌ Web3Forms error:', result)

            // Fallback: Try a simple SMTP service
            console.log('🔄 Trying SMTP fallback...')

            try {
                // Use a simple email forwarding service
                const smtpResponse = await fetch('https://formspree.io/f/your_form_id', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        subject: subject || 'LoyalLink Notification',
                        message: message,
                        _replyto: email,
                        _subject: subject || 'LoyalLink Notification'
                    })
                })

                if (smtpResponse.ok) {
                    console.log('✅ Email sent successfully via Formspree fallback!')
                    return NextResponse.json({
                        success: true,
                        message: 'Email sent successfully via Formspree',
                        service: 'formspree'
                    })
                }
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError)
            }

            return NextResponse.json(
                {
                    error: 'Failed to send email via Web3Forms and fallback',
                    details: result
                },
                { status: 500 }
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