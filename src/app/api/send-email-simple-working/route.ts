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

        console.log('📧 Sending email via FormSubmit (free service)...')

        // Use FormSubmit.co - a free service that sends emails without API keys
        const formData = new FormData()
        formData.append('_to', email)
        formData.append('_subject', subject || 'LoyalLink Notification')
        formData.append('_template', 'table')
        formData.append('_captcha', 'false')
        formData.append('_next', 'https://loyallinkk.vercel.app/email-sent')
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
                message: 'Email sent successfully via FormSubmit',
                service: 'formsubmit'
            })
        } else {
            console.error('❌ FormSubmit error:', result)

            // Fallback: Try EmailJS
            console.log('🔄 Trying EmailJS fallback...')

            const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: 'service_loyallink',
                    template_id: 'template_loyallink',
                    user_id: 'your_emailjs_public_key',
                    template_params: {
                        to_email: email,
                        subject: subject || 'LoyalLink Notification',
                        message: message,
                        customer_name: customerName || 'Valued Customer'
                    }
                })
            })

            if (emailjsResponse.ok) {
                console.log('✅ Email sent successfully via EmailJS fallback!')
                return NextResponse.json({
                    success: true,
                    message: 'Email sent successfully via EmailJS',
                    service: 'emailjs'
                })
            }

            return NextResponse.json(
                {
                    error: 'Failed to send email via both FormSubmit and EmailJS',
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