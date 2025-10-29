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

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params
    try {
        const customerId = params.id

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        // Fetch customer data
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (customerError) {
            console.error('Error fetching customer:', customerError)
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Generate QR code if missing
        if (!customer.qr_code_url) {
            console.log('🔄 Generating missing QR code for customer:', customerId)
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loyallinkk.vercel.app'
            const qrData = `${baseUrl}/mark-visit/${customer.id}`
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

            // Update customer with QR code info
            const { error: updateError } = await supabaseAdmin
                .from('customers')
                .update({
                    qr_code_url: qrCodeUrl,
                    qr_data: qrData
                })
                .eq('id', customer.id)

            if (!updateError) {
                customer.qr_code_url = qrCodeUrl
                customer.qr_data = qrData
                console.log('✅ QR code generated and saved')
            } else {
                console.error('❌ Failed to save QR code:', updateError)
            }
        }

        // Fetch business data
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', customer.business_id)
            .single()

        if (businessError) {
            console.error('Error fetching business:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            customer,
            business
        })

    } catch (error) {
        console.error('Error in customer API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params
    try {
        const customerId = params.id
        const body = await request.json()

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        // Update customer with provided data
        const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update(body)
            .eq('id', customerId)

        if (updateError) {
            console.error('Error updating customer:', updateError)
            return NextResponse.json(
                { error: 'Failed to update customer' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Customer updated successfully'
        })

    } catch (error) {
        console.error('Error in customer PATCH API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}