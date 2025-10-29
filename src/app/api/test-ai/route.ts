import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function GET() {
    try {
        console.log('🧪 Testing AI service...')

        // Check environment variables first
        const hasApiKey = !!process.env.OPENROUTER_API_KEY
        const keyLength = process.env.OPENROUTER_API_KEY?.length || 0

        console.log('🔑 API Key status:', { hasApiKey, keyLength })

        if (!hasApiKey) {
            return NextResponse.json({
                success: false,
                error: 'OpenRouter API key not found in environment',
                debug: {
                    hasApiKey,
                    keyLength,
                    availableEnvKeys: Object.keys(process.env).filter(key =>
                        key.includes('OPENROUTER') || key.includes('AI')
                    )
                }
            })
        }

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
            debug: {
                hasApiKey,
                keyLength,
                keyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 15) + '...'
            }
        })
    } catch (error) {
        console.error('🚨 Test AI error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                hasApiKey: !!process.env.OPENROUTER_API_KEY,
                keyLength: process.env.OPENROUTER_API_KEY?.length || 0
            }
        })
    }
}