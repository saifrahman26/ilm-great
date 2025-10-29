import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function GET() {
    try {
        console.log('🔍 Testing AI service...')

        // Test basic AI functionality
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
            testContent: testResponse.content,
            error: testResponse.error,
            environment: {
                hasApiKey: !!process.env.OPENROUTER_API_KEY,
                apiKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
                siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
                siteName: process.env.NEXT_PUBLIC_SITE_NAME
            }
        })
    } catch (error) {
        console.error('Debug AI error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: {
                hasApiKey: !!process.env.OPENROUTER_API_KEY,
                apiKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
                siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
                siteName: process.env.NEXT_PUBLIC_SITE_NAME
            }
        })
    }
}