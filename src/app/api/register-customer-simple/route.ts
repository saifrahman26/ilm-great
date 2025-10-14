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
    console.log('🚀 Simple register customer API called')

    try {
        const { businessId, name, phone, email } = await request.json()

        console.log('📝 Registration data:', { businessId, name, phone, email })

        // Validate required fields
        if (!businessId || !name || !phone) {
            return NextResponse.json(
                { error: 'Business ID, name, and phone are required' },
                { status: 400 }
            )
        }

        // Generate a simple customer ID
        const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Create customer record
        const customerData = {
            id: customerId,
            business_id: businessId,
            name: name.trim(),
            phone: phone.trim(),
            email: email?.trim() || null,
            visits: 1,
            last_visit: new Date().toISOString(),
            created_at: new Date().toISOString()
        }

        console.log('👤 Creating customer:', customerData)

        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .insert(customerData)
            .select()
            .single()

        if (customerError) {
            console.error('❌ Error creating customer:', customerError)
            return NextResponse.json(
                { error: `Failed to create customer: ${customerError.message}` },
                { status: 500 }
            )
        }

        // Generate QR code
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loyallinkk.vercel.app'
        const qrData = `${baseUrl}/scan?customer=${customer.id}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

        // Update customer with QR code
        const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
                qr_code_url: qrCodeUrl,
                qr_data: customer.id
            })
            .eq('id', customer.id)

        if (updateError) {
            console.error('⚠️ Error updating QR code (non-critical):', updateError)
        }

        console.log('✅ Customer created successfully:', customer.id)

        // Return customer with QR code
        const finalCustomer = {
            ...customer,
            qr_code_url: qrCodeUrl,
            qr_data: customer.id
        }

        return NextResponse.json({
            success: true,
            customer: finalCustomer,
            message: `Customer ${name} registered successfully!`
        })

    } catch (error) {
        console.error('❌ Simple registration error:', error)
        return NextResponse.json(
            { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}