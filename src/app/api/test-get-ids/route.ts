import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
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

export async function GET() {
    console.log('🔍 Getting test IDs from database')

    try {
        // Get a business
        const { data: businesses, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('id, name')
            .limit(1)

        if (businessError) {
            console.error('❌ Business query error:', businessError)
            return NextResponse.json({ error: 'Failed to get business', details: businessError })
        }

        // Get a customer
        const { data: customers, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('id, name, business_id')
            .limit(1)

        if (customerError) {
            console.error('❌ Customer query error:', customerError)
            return NextResponse.json({ error: 'Failed to get customer', details: customerError })
        }

        console.log('✅ Found data:', { businesses, customers })

        return NextResponse.json({
            success: true,
            businesses: businesses || [],
            customers: customers || [],
            testIds: {
                businessId: businesses?.[0]?.id || null,
                customerId: customers?.[0]?.id || null,
                businessName: businesses?.[0]?.name || null,
                customerName: customers?.[0]?.name || null
            }
        })

    } catch (error) {
        console.error('❌ Test get IDs error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        )
    }
}