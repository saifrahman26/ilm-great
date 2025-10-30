import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email, customerName, businessName, rewardTitle } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Test the reward token email directly from server-side
        const { sendRewardTokenEmail } = await import('@/lib/messaging')

        const testCustomer = {
            id: 'test-customer-123',
            name: customerName || 'Test Customer',
            email: email,
            phone: '+1234567890'
        }

        const testBusiness = {
            id: 'test-business-123',
            name: businessName || 'Test Coffee Shop',
            business_type: 'Coffee Shop',
            reward_title: rewardTitle || 'Free Coffee',
            reward_description: 'Get a free coffee of your choice'
        }

        const testToken = '123456'

        console.log('🧪 Testing reward email from server-side API...')
        console.log('📧 Sending to:', email)
        console.log('🏪 Business:', testBusiness.name)
        console.log('🎁 Reward:', testBusiness.reward_title)

        await sendRewardTokenEmail(testCustomer, testBusiness, testToken)

        return NextResponse.json({
            success: true,
            message: 'Reward email sent successfully!',
            details: {
                customer: testCustomer.name,
                business: testBusiness.name,
                reward: testBusiness.reward_title,
                token: testToken,
                email: email
            }
        })

    } catch (error) {
        console.error('❌ Test reward email API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: error
            },
            { status: 500 }
        )
    }
}