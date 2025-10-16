import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Check if Brevo API key is configured
        if (!process.env.BREVO_API_KEY) {
            return NextResponse.json(
                { error: 'BREVO_API_KEY is not configured' },
                { status: 500 }
            )
        }

        console.log('🔑 Testing Brevo API...')
        console.log('🔑 API key length:', process.env.BREVO_API_KEY.length)
        console.log('📧 Sender email:', process.env.BREVO_SENDER_EMAIL)
        console.log('📧 Target email:', email)

        // Simple test email
        const emailData = {
            sender: {
                name: 'LoyalLink Test',
                email: process.env.BREVO_SENDER_EMAIL || 'noreply@loyallink.com'
            },
            to: [
                {
                    email: email,
                    name: 'Test User'
                }
            ],
            subject: 'Brevo API Test - Simple Email',
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4f46e5;">✅ Brevo API Test Successful!</h2>
                    <p>This is a simple test email to verify that the Brevo API is working correctly.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Sent to:</strong> ${email}</p>
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #0369a1;">
                            🎉 If you received this email, the Brevo integration is working perfectly!
                        </p>
                    </div>
                </div>
            `,
            textContent: `Brevo API Test Successful! This is a simple test email sent at ${new Date().toISOString()}`
        }

        console.log('📤 Sending email with data:', JSON.stringify(emailData, null, 2))

        // Send email using Brevo API
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        })

        const result = await response.json()

        console.log('📥 Brevo API response:', {
            status: response.status,
            statusText: response.statusText,
            result: result
        })

        if (response.ok) {
            console.log('✅ Email sent successfully via Brevo!')
            return NextResponse.json({
                success: true,
                result,
                message: 'Test email sent successfully via Brevo API',
                emailId: result.messageId
            })
        } else {
            console.error('❌ Brevo API error:', result)
            return NextResponse.json(
                {
                    error: 'Brevo API error',
                    details: result,
                    status: response.status,
                    statusText: response.statusText
                },
                { status: response.status }
            )
        }
    } catch (error) {
        console.error('💥 Error in Brevo test:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}