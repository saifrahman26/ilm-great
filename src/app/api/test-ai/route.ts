import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function GET() {
    try {
        // Test AI service connection
        const testResponse = await aiService.generatePersonalizedEmail({
            businessName: 'Test Coffee Shop',
            businessType: 'Coffee Shop',
            customerName: 'John Doe',
            visitCount: 3,
            visitGoal: 5,
            rewardTitle: 'Free Coffee',
            isRewardReached: false,
            emailType: 'visit_confirmation'
        })

        return NextResponse.json({
            success: true,
            aiWorking: testResponse.success,
            testMessage: testResponse.content || testResponse.error,
            apiKeyConfigured: !!process.env.OPENROUTER_API_KEY
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            apiKeyConfigured: !!process.env.OPENROUTER_API_KEY
        })
    }
}