import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, sendAIEnhancedEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const {
            to,
            testType = 'basic',
            customerName = 'Test Customer',
            businessName = 'Test Business'
        } = await request.json()

        if (!to) {
            return NextResponse.json(
                { success: false, error: 'Email address is required' },
                { status: 400 }
            )
        }

        console.log(`🧪 Testing email send to: ${to}, type: ${testType}`)

        let result = false
        let details = ''

        if (testType === 'basic') {
            // Test basic email sending
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>🧪 Email Test</h2>
                    <p>This is a test email from LinkLoyal.</p>
                    <p>If you received this, email sending is working correctly!</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                </div>
            `

            result = await sendEmail(to, '🧪 LinkLoyal Email Test', htmlContent)
            details = 'Basic email test'

        } else if (testType === 'ai-enhanced') {
            // Test AI-enhanced email
            result = await sendAIEnhancedEmail(
                to,
                customerName,
                businessName,
                'Coffee Shop',
                'visit_confirmation',
                {
                    visitCount: 3,
                    visitGoal: 5,
                    rewardTitle: 'Free Coffee',
                    isRewardReached: false
                }
            )
            details = 'AI-enhanced email test'
        }

        return NextResponse.json({
            success: result,
            message: result
                ? `✅ ${details} email sent successfully to ${to}`
                : `❌ ${details} email failed to send to ${to}`,
            testType,
            to,
            timestamp: new Date().toISOString(),
            environment: {
                hasResendKey: !!process.env.RESEND_API_KEY,
                resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
                verifiedEmail: process.env.VERIFIED_EMAIL,
                emailService: process.env.EMAIL_SERVICE
            }
        })

    } catch (error) {
        console.error('❌ Email test error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                environment: {
                    hasResendKey: !!process.env.RESEND_API_KEY,
                    resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
                    verifiedEmail: process.env.VERIFIED_EMAIL,
                    emailService: process.env.EMAIL_SERVICE
                }
            },
            { status: 500 }
        )
    }
}