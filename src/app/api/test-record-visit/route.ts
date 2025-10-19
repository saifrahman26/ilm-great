import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    console.log('🧪 Test record visit API called')

    try {
        const requestBody = await request.json()
        console.log('📥 Test received request body:', requestBody)

        const { customerId, businessId } = requestBody

        console.log('🔍 Test extracted values:', {
            customerId,
            businessId,
            customerIdType: typeof customerId,
            businessIdType: typeof businessId,
            customerIdTruthy: !!customerId,
            businessIdTruthy: !!businessId,
            customerIdLength: customerId?.length,
            businessIdLength: businessId?.length
        })

        if (!customerId || !businessId) {
            console.log('❌ Test missing required fields')
            return NextResponse.json(
                {
                    error: 'Customer ID and Business ID are required',
                    received: { customerId, businessId },
                    types: {
                        customerIdType: typeof customerId,
                        businessIdType: typeof businessId
                    }
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Test successful',
            received: { customerId, businessId },
            types: {
                customerIdType: typeof customerId,
                businessIdType: typeof businessId
            }
        })

    } catch (error) {
        console.error('❌ Test record visit error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        )
    }
}