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

        // Check if API key is configured
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY is not configured in environment variables' },
                { status: 500 }
            )
        }

        console.log('🧪 Testing email with:', {
            apiKey: process.env.RESEND_API_KEY.substring(0, 10) + '...',
            targetEmail: email
        })

        // Send a simple test email
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Test <onboarding@resend.dev>',
                to: email,
                subject: '🧪 Email Test - LoyalLink',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #059669;">✅ Email Test Successful!</h2>
                        <p>This is a test email from your LoyalLink application.</p>
                        <p>If you received this email, your email configuration is working correctly!</p>
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534;"><strong>✅ Email service is configured and working!</strong></p>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            Sent at: ${new Date().toLocaleString()}
                        </p>
                    </div>
                `,
                text: 'Email Test - If you received this email, your email configuration is working correctly!'
            })
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Test email sent successfully:', result)
            return NextResponse.json({
                success: true,
                result,
                message: 'Test email sent successfully! Check your inbox.'
            })
        } else {
            console.error('❌ Test email failed:', {
                status: response.status,
                statusText: response.statusText,
                result
            })
            return NextResponse.json(
                {
                    error: 'Failed to send test email',
                    details: result,
                    status: response.status,
                    statusText: response.statusText
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('❌ Test email error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}