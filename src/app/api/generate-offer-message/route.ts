import { NextRequest, NextResponse } from 'next/server'
import { generateOfferMessage } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { businessName, businessCategory, offerTitle, targetAudience, customerCount } = await request.json()

        if (!businessName || !offerTitle) {
            return NextResponse.json(
                { error: 'Business name and offer title are required' },
                { status: 400 }
            )
        }

        console.log('🤖 Generating AI offer message:', {
            businessName,
            businessCategory,
            offerTitle,
            targetAudience,
            customerCount
        })

        const message = await generateOfferMessage({
            businessName,
            businessCategory: businessCategory || 'business',
            offerTitle,
            targetAudience: targetAudience || 'all',
            customerCount: customerCount || 0
        })

        console.log('✅ AI offer message generated successfully')

        return NextResponse.json({
            success: true,
            message
        })

    } catch (error) {
        console.error('❌ Generate offer message error:', error)
        return NextResponse.json(
            { error: 'Failed to generate offer message' },
            { status: 500 }
        )
    }
}