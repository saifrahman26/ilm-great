import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function GET() {
    try {
        console.log('🔍 Testing AI service...')

        // Test basic AI functionality with a simple message
        const testResponse = await aiService.generateResponse([
            {
                role: 'system',
                content: 'You are a helpful assistant. Respond briefly and clearly.'
            },
            {
                role: 'user',
                content: 'Write a short thank you message for a coffee shop customer who just completed their 3rd visit out of 5 needed for a free coffee reward.'
            }
        ])

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