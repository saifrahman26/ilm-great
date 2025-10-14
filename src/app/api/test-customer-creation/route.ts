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
    console.log('🧪 Test customer creation API called')

    try {
        const { businessId, name, phone, email } = await request.json()

        console.log('📝 Test data:', { businessId, name, phone, email })

        // Test 1: Check Supabase connection
        console.log('🔗 Test 1: Checking Supabase connection...')
        const { data: connectionTest, error: connectionError } = await supabaseAdmin
            .from('businesses')
            .select('id')
            .limit(1)

        if (connectionError) {
            console.error('❌ Connection test failed:', connectionError)
            return NextResponse.json({
                success: false,
                error: 'Supabase connection failed',
                details: connectionError
            })
        }
        console.log('✅ Connection test passed')

        // Test 2: Check if business exists
        console.log('🏢 Test 2: Checking if business exists...')
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError) {
            console.error('❌ Business check failed:', businessError)
            return NextResponse.json({
                success: false,
                error: 'Business not found',
                details: businessError
            })
        }
        console.log('✅ Business found:', business.name)

        // Test 3: Try to create customer
        console.log('👤 Test 3: Creating test customer...')
        const testCustomer = {
            business_id: businessId,
            name: name || 'Test Customer',
            phone: phone || '1234567890',
            email: email || 'test@example.com',
            visits: 1,
            last_visit: new Date().toISOString(),
            created_at: new Date().toISOString()
        }

        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .insert(testCustomer)
            .select()
            .single()

        if (customerError) {
            console.error('❌ Customer creation failed:', customerError)
            return NextResponse.json({
                success: false,
                error: 'Customer creation failed',
                details: customerError
            })
        }

        console.log('✅ Customer created successfully:', customer)

        return NextResponse.json({
            success: true,
            message: 'All tests passed',
            customer: customer,
            business: business
        })

    } catch (error) {
        console.error('❌ Test API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Test API failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Test customer creation API',
        usage: 'POST with { businessId, name, phone, email }'
    })
}