import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Testing registration email flow...')

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Test customer object (similar to what register-customer creates)
        const testCustomer = {
            id: 'test-customer-id-' + Date.now(),
            name: 'Test Customer',
            email: email,
            phone: '+1234567890',
            email_confirmed: false,
            visits: 1,
            last_visit: new Date().toISOString(),
            business_id: 'test-business-id',
            created_at: new Date().toISOString(),
            qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=test-${Date.now()}`,
            qr_data: `test-${Date.now()}`
        }

        console.log('📧 Testing sendQRCodeToCustomer function...')
        console.log('Customer object:', testCustomer)

        try {
            // Import and test the sendQRCodeToCustomer function
            const { sendQRCodeToCustomer } = await import('@/lib/messaging')
            await sendQRCodeToCustomer(testCustomer)

            console.log('✅ sendQRCodeToCustomer completed successfully')

            return NextResponse.json({
                success: true,
                message: 'QR code email sent successfully',
                testCustomer: testCustomer
            })

        } catch (emailError) {
            console.error('❌ sendQRCodeToCustomer failed:', emailError)

            // Try direct email API call as fallback
            console.log('🔄 Trying direct email API call...')

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Loyalty QR Code</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; text-align: center;">🎉 Welcome to Our Loyalty Program!</h1>
        <p>Hi ${testCustomer.name},</p>
        <p>Thank you for joining our loyalty program! Here's your personal QR code:</p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <img src="${testCustomer.qr_code_url}" alt="Your Personal QR Code" style="max-width: 250px; height: auto;" />
            <p style="font-size: 14px; color: #6b7280;">Your Personal QR Code</p>
        </div>
        <p>Show this QR code when you visit our store to earn points!</p>
    </div>
</body>
</html>`

            const directResponse = await fetch('http://localhost:3000/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    message: emailHtml,
                    subject: '🎉 Welcome! Your Loyalty QR Code (Direct Test)',
                    template: 'raw-html'
                })
            })

            const directResult = await directResponse.json()

            return NextResponse.json({
                success: directResponse.ok,
                message: directResponse.ok ? 'Direct email API worked' : 'Both methods failed',
                sendQRCodeError: emailError instanceof Error ? emailError.message : 'Unknown error',
                directApiResult: directResult,
                testCustomer: testCustomer
            })
        }

    } catch (error) {
        console.error('❌ Test registration email error:', error)
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}