import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { businessName, businessCategory, customCategory, rewardTitle, visitGoal } = await request.json()

        if (!businessName || !businessCategory) {
            return NextResponse.json(
                { error: 'Business name and category are required' },
                { status: 400 }
            )
        }

        // Get business type for context
        const businessType = businessCategory === 'other' ? customCategory : businessCategory

        // Generate category-specific offers
        const offers = getCategoryOffers(businessCategory)
        const randomOffer = offers[Math.floor(Math.random() * offers.length)]

        // Create AI prompt for inactive customer message
        const prompt = `Generate a warm, personalized re-engagement email message for inactive customers of a ${businessType} business called "${businessName}".

Business Details:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Reward Program: ${rewardTitle} after ${visitGoal} visits
- Special Offer: ${randomOffer}

Requirements:
- Keep it friendly and personal (150-200 words)
- Include the special offer: ${randomOffer}
- Mention they're missed and valued
- Create urgency but not pushy
- Include a clear call-to-action to return
- Don't include subject line or email headers
- Write in a conversational, warm tone

The message should make the customer feel valued and excited to return.`

        const aiMessage = await generateAIContent(prompt)

        return NextResponse.json({
            message: aiMessage,
            offer: randomOffer,
            businessType: businessType
        })

    } catch (error) {
        console.error('Error generating inactive message:', error)
        return NextResponse.json(
            { error: 'Failed to generate message' },
            { status: 500 }
        )
    }
}

// Category-specific offers
function getCategoryOffers(category: string): string[] {
    const offerMap: Record<string, string[]> = {
        'cafe': [
            '20% off your next coffee',
            'Buy one coffee, get one free',
            'Free pastry with any drink purchase',
            'Complimentary size upgrade on your favorite drink'
        ],
        'restaurant': [
            '15% off your next meal',
            'Free appetizer with entree purchase',
            'Complimentary dessert with dinner',
            '2-for-1 on selected main courses'
        ],
        'food_hall': [
            '20% off your next order',
            'Free side with any main dish',
            'Buy 2 items, get 1 free',
            '$5 off orders over $25'
        ],
        'bakery': [
            '25% off fresh pastries',
            'Free coffee with any pastry purchase',
            'Buy 6 items, get 2 free',
            'Complimentary cake slice with purchase'
        ],
        'salon': [
            '20% off your next service',
            'Free deep conditioning treatment',
            'Complimentary styling consultation',
            '15% off hair care products'
        ],
        'beauty_parlor': [
            '25% off facial treatments',
            'Free eyebrow threading with facial',
            'Complimentary makeup touch-up',
            '20% off beauty packages'
        ],
        'boutique': [
            '30% off selected items',
            'Buy 2, get 1 at 50% off',
            'Free styling consultation',
            '25% off new arrivals'
        ],
        'mens_wear': [
            '25% off suits and formal wear',
            'Free tie with shirt purchase',
            'Buy 2 shirts, get 1 free',
            '20% off accessories'
        ],
        'womens_wear': [
            '30% off dresses and tops',
            'Free scarf with any purchase over $50',
            'Buy 2 items, get 1 at 50% off',
            '25% off seasonal collection'
        ],
        'retail_store': [
            '20% off your entire purchase',
            'Free gift with purchase over $30',
            'Buy 3, pay for 2',
            '$10 off orders over $50'
        ],
        'pharmacy': [
            '15% off health and wellness products',
            'Free health consultation',
            'Buy 2 vitamins, get 1 free',
            '20% off personal care items'
        ],
        'gym_fitness': [
            'Free personal training session',
            '50% off next month\'s membership',
            'Complimentary fitness assessment',
            'Free guest pass for a friend'
        ],
        'electronics': [
            '15% off accessories',
            'Free screen protector with phone purchase',
            'Extended warranty at no extra cost',
            '10% off your next gadget'
        ],
        'jewelry': [
            '20% off fine jewelry',
            'Free jewelry cleaning service',
            'Complimentary appraisal',
            '25% off custom designs'
        ],
        'automotive': [
            '20% off next service',
            'Free car wash with oil change',
            'Complimentary vehicle inspection',
            '15% off parts and accessories'
        ]
    }

    return offerMap[category] || [
        '20% off your next purchase',
        'Special discount just for you',
        'Exclusive offer for valued customers',
        'Come back and save on your favorite items'
    ]
}