import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Testing AI service...')

        // Test basic AI functionality
        const testResponse = await aiService.generateWinBackEmail({
            businessName: 'Test Cafe',
            businessType: 'cafe',
            customerName: 'John',
            visitCount: 2,
            visitGoal: 5,
            rewardTitle: 'Free Coffee',
            daysSinceLastVisit: 15,
            specialOffer: '20% off your next coffee'
        })

        console.log('🤖 AI Response:', testResponse)

        return NextResponse.json({
            success: true,
            aiResponse: testResponse,
            message: 'AI service test completed'
        })

    } catch (error) {
        console.error('❌ AI service test failed:', error)
        return NextResponse.json(
            {
                error: 'AI service test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'AI service test endpoint - use POST to test'
    })
}