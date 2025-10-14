import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for customer registration
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
    console.log('🚀 Register customer (no email) API called')

    try {
        const requestBody = await request.json()
        console.log('📝 Request body:', requestBody)

        const { businessId, name, phone, email } = requestBody

        console.log('🔍 Parsed data:', { businessId, name, phone, email })

        if (!businessId || !name || !phone) {
            console.log('❌ Missing required fields')
            return NextResponse.json(
                { error: 'Business ID, name, and phone are required' },
                { status: 400 }
            )
        }

        // Check if customer already exists
        console.log('🔍 Checking for existing customer...')
        const { data: existingCustomer, error: checkError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .eq('phone', phone)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking existing customer:', checkError)
            return NextResponse.json(
                { error: `Database error: ${checkError.message}` },
                { status: 500 }
            )
        }

        if (existingCustomer) {
            console.log('✅ Customer already exists, updating information...')

            // Update existing customer
            const updateData: any = {
                visits: existingCustomer.visits + 1,
                last_visit: new Date().toISOString()
            }

            // Only update email if it's provided and different from existing
            if (email?.trim() && email.trim() !== existingCustomer.email) {
                updateData.email = email.trim()
                console.log('📧 Updating email for existing customer')
            }

            // Update name if it's different
            if (name.trim() !== existingCustomer.name) {
                updateData.name = name.trim()
                console.log('👤 Updating name for existing customer')
            }

            const { data: updatedCustomer, error: updateError } = await supabaseAdmin
                .from('customers')
                .update(updateData)
                .eq('id', existingCustomer.id)
                .select()
                .single()

            if (updateError) {
                console.error('❌ Error updating existing customer:', updateError)
                return NextResponse.json(
                    { error: `Failed to update customer: ${updateError.message}` },
                    { status: 500 }
                )
            }

            // Record the visit
            console.log('📝 Recording visit for existing customer...')
            try {
                const { error: visitError } = await supabaseAdmin
                    .from('visits')
                    .insert({
                        business_id: businessId,
                        customer_id: existingCustomer.id,
                        visit_date: new Date().toISOString(),
                        points_earned: 1,
                        notes: 'Visit recorded - Welcome back!',
                        created_at: new Date().toISOString()
                    })

                if (visitError) {
                    console.error('❌ Error recording visit:', visitError)
                } else {
                    console.log('✅ Visit recorded successfully')
                }
            } catch (visitException) {
                console.error('❌ Exception recording visit:', visitException)
            }

            return NextResponse.json({
                success: true,
                customer: updatedCustomer,
                message: `Welcome back ${name}! Visit recorded and information updated.`,
                isExistingCustomer: true,
                emailSkipped: true
            })
        }

        console.log('✅ No existing customer found')

        // Create customer first to get the ID
        console.log('👤 Creating customer...')
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .insert({
                business_id: businessId,
                name: name.trim(),
                phone: phone.trim(),
                email: email?.trim() || null,
                visits: 1, // Registration counts as first visit!
                last_visit: new Date().toISOString(),
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (customerError) {
            console.error('❌ Error creating customer:', customerError)
            return NextResponse.json(
                { error: `Failed to create customer: ${customerError.message}` },
                { status: 500 }
            )
        }

        // Generate QR code with customer ID that links to scanner page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const qrData = `${baseUrl}/scanner?customer=${customer.id}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

        // Update customer with QR code info
        const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
                qr_code_url: qrCodeUrl,
                qr_data: customer.id // Store customer ID for direct lookup
            })
            .eq('id', customer.id)

        if (updateError) {
            console.error('❌ Error updating customer with QR code:', updateError)
            // Don't fail registration if QR update fails
        }

        console.log('✅ Customer created successfully:', {
            id: customer.id,
            name: customer.name,
            qrData: qrData,
            qrCodeUrl: qrCodeUrl
        })

        // Record the first visit in visits table
        console.log('📝 Recording first visit...')
        try {
            const { error: visitError } = await supabaseAdmin
                .from('visits')
                .insert({
                    business_id: businessId,
                    customer_id: customer.id,
                    visit_date: new Date().toISOString(),
                    points_earned: 1,
                    notes: 'Registration visit - Welcome to our loyalty program!',
                    created_at: new Date().toISOString()
                })

            if (visitError) {
                console.error('❌ Error recording first visit:', visitError)
            } else {
                console.log('✅ First visit recorded successfully')
            }
        } catch (visitException) {
            console.error('❌ Exception recording visit:', visitException)
        }

        // Return updated customer object with QR code info
        const updatedCustomer = {
            ...customer,
            qr_code_url: qrCodeUrl,
            qr_data: qrData
        }

        return NextResponse.json({
            success: true,
            customer: updatedCustomer,
            message: `Customer ${name} registered successfully with first visit recorded!`,
            emailSkipped: true,
            note: 'Email sending was skipped to avoid API key issues. QR code can be displayed directly.'
        })

    } catch (error) {
        console.error('❌ Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}