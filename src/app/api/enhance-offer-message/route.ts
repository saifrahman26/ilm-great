import { NextRequest, NextResponse } from 'next/server'
import { enhanceOfferMessage } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { originalMessage, businessName, businessCategory } = await request.json()

        if (!originalMessage || !businessName) {
            return NextResponse.json(
                { error: 'Original message and business name are required' },
                { status: 400 }
            )
        }

        console.log('🤖 Enhancing offer message with AI:', {
            businessName,
            businessCategory,
            messageLength: originalMessage.length
        })

        const enhancedMessage = await enhanceOfferMessage({
            originalMessage,
            businessName,
            businessCategory: businessCategory || 'business'
        })

        console.log('✅ Offer message enhanced successfully')

        return NextResponse.json({
            success: true,
            enhancedMessage
        })

    } catch (error) {
        console.error('❌ Enhance offer message error:', error)
        return NextResponse.json(
            { error: 'Failed to enhance offer message' },
            { status: 500 }
        )
    }
}