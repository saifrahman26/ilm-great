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
    console.log('🚀 Simple register customer API called')

    try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 10000)
        )

        const requestPromise = request.json()
        const { businessId, name, phone, email } = await Promise.race([requestPromise, timeoutPromise]) as any

        console.log('📝 Simple registration data:', { businessId, name, phone, email })

        if (!businessId || !name || !phone) {
            return NextResponse.json(
                { error: 'Business ID, name, and phone are required' },
                { status: 400 }
            )
        }

        // Check if customer exists
        console.log('🔍 Checking for existing customer...')
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .eq('phone', phone)
            .single()

        if (existingCustomer) {
            console.log('✅ Customer exists, updating...')
            const { data: updatedCustomer, error: updateError } = await supabaseAdmin
                .from('customers')
                .update({
                    visits: existingCustomer.visits + 1,
                    last_visit: new Date().toISOString(),
                    email: email?.trim() || existingCustomer.email
                })
                .eq('id', existingCustomer.id)
                .select()
                .single()

            if (updateError) {
                console.error('❌ Update error:', updateError)
                return NextResponse.json({ error: updateError.message }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                customer: updatedCustomer,
                isExistingCustomer: true,
                businessName: 'Business'
            })
        }

        // Create new customer
        console.log('👤 Creating new customer...')
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .insert({
                business_id: businessId,
                name: name.trim(),
                phone: phone.trim(),
                email: email?.trim() || null,
                visits: 1,
                last_visit: new Date().toISOString(),
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (customerError) {
            console.error('❌ Customer creation error:', customerError)
            return NextResponse.json({ error: customerError.message }, { status: 500 })
        }

        console.log('✅ Customer created:', customer.id)

        return NextResponse.json({
            success: true,
            customer: customer,
            businessName: 'Business'
        })

    } catch (error) {
        console.error('❌ Simple registration error:', error)
        return NextResponse.json(
            { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}