import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: NextRequest) {
    try {
        const { businessId, identifier } = await request.json()

        if (!businessId || !identifier) {
            return NextResponse.json(
                { error: 'Business ID and identifier (email/phone) are required' },
                { status: 400 }
            )
        }

        console.log('🔍 Finding customer:', { businessId, identifier })

        // Search for customer by email or phone in the specified business
        const { data: customers, error: searchError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .or(`email.eq.${identifier},phone.eq.${identifier}`)

        if (searchError) {
            console.error('❌ Error searching customers:', searchError)
            return NextResponse.json(
                { error: 'Failed to search customers' },
                { status: 500 }
            )
        }

        if (!customers || customers.length === 0) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        const customer = customers[0] // Take the first match

        // Get business details
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            console.error('❌ Error fetching business:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        console.log('✅ Customer found:', {
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            visits: customer.visits
        })

        return NextResponse.json({
            success: true,
            customer,
            business
        })

    } catch (error) {
        console.error('❌ Find customer error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}