import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
    try {
        const { to } = await request.json()

        if (!to) {
            return NextResponse.json(
                { success: false, error: 'Email address required' },
                { status: 400 }
            )
        }

        console.log('🧪 Testing Resend directly...')
        console.log('📧 API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')
        console.log('📧 To:', to)

        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
            from: 'LinkLoyal <onboarding@resend.dev>',
            to: [to],
            subject: '🧪 Direct Resend Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>🧪 Direct Resend Test</h2>
                    <p>This is a direct test of the Resend API.</p>
                    <p>If you received this, Resend is working correctly!</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                </div>
            `,
        })

        if (error) {
            console.error('❌ Resend error:', error)
            return NextResponse.json({
                success: false,
                error: error.message || 'Resend API error',
                details: error
            })
        }

        console.log('✅ Email sent successfully:', data?.id)
        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            emailId: data?.id,
            data
        })

    } catch (error) {
        console.error('❌ Exception:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error
        })
    }
}