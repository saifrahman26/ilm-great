import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Testing Resend API directly...')

        // Check if API key is configured
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY is not configured' },
                { status: 500 }
            )
        }

        console.log('🔑 API Key present:', process.env.RESEND_API_KEY.substring(0, 10) + '...')

        // Test direct call to Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Test <onboarding@resend.dev>',
                to: 'warriorsaifdurer@gmail.com',
                subject: '🧪 Direct Resend API Test',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #059669;">✅ Direct Resend API Test</h2>
                        <p>This email was sent directly to the Resend API to test the connection.</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'unknown'}</p>
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534;"><strong>✅ Resend API is working!</strong></p>
                        </div>
                    </div>
                `,
                text: 'Direct Resend API Test - If you received this email, the Resend API is working correctly!'
            })
        })

        const result = await response.json()

        console.log('📧 Resend API response:', {
            status: response.status,
            statusText: response.statusText,
            result
        })

        if (response.ok) {
            console.log('✅ Direct Resend API test successful!')
            return NextResponse.json({
                success: true,
                result,
                message: 'Direct Resend API test successful! Check warriorsaifdurer@gmail.com'
            })
        } else {
            console.error('❌ Direct Resend API test failed:', result)
            return NextResponse.json(
                {
                    error: 'Direct Resend API test failed',
                    details: result,
                    status: response.status,
                    statusText: response.statusText
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('❌ Direct Resend API test error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}