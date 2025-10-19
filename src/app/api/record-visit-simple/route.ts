import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    console.log('🚀 Simple record visit API called')

    try {
        const requestBody = await request.json()
        console.log('📥 Simple received request body:', requestBody)

        const { customerId, businessId } = requestBody

        console.log('🔍 Simple extracted values:', {
            customerId,
            businessId,
            customerIdType: typeof customerId,
            businessIdType: typeof businessId,
            customerIdTruthy: !!customerId,
            businessIdTruthy: !!businessId
        })

        if (!customerId || !businessId) {
            console.log('❌ Simple missing required fields')
            return NextResponse.json(
                {
                    error: 'Customer ID and Business ID are required',
                    received: { customerId, businessId }
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Simple test successful - would record visit here',
            received: { customerId, businessId }
        })

    } catch (error) {
        console.error('❌ Simple record visit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}