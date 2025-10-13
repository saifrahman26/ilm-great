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
    console.log('🚀 Register customer API called')

    try {
        const requestBody = await request.json()
        console.log('📝 Request body:', requestBody)

        const { businessId, name, phone, email, businessName, rewardTitle, visitGoal } = requestBody

        console.log('🔍 Parsed data:', { businessId, name, phone, email, businessName, rewardTitle, visitGoal })

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
            console.log('❌ Customer already exists')
            return NextResponse.json(
                { error: `Customer with phone number ${phone} already exists` },
                { status: 409 }
            )
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

        // Generate QR code with customer ID that links to scan page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const qrData = `${baseUrl}/scan?customer=${customer.id}`
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

        // Send QR code email if email is provided
        if (email?.trim()) {
            console.log('📧 Attempting to send QR code email...')
            console.log('📧 Email address:', email)
            console.log('📧 Customer name:', customer.name)
            console.log('📧 QR code URL:', qrCodeUrl)

            try {
                // Create updated customer object with QR code info for email
                const customerWithQR = {
                    ...customer,
                    qr_code_url: qrCodeUrl,
                    qr_data: qrData
                }

                // Create business info object for email
                const businessInfo = {
                    name: businessName || 'LoyalLink Business',
                    rewardTitle: rewardTitle || 'Loyalty Reward',
                    visitGoal: visitGoal || 5
                }

                console.log('📧 Customer object for email:', customerWithQR)
                console.log('📧 Business info for email:', businessInfo)

                const { sendQRCodeToCustomer } = await import('@/lib/messaging')
                console.log('📧 sendQRCodeToCustomer function imported successfully')

                await sendQRCodeToCustomer(customerWithQR, businessInfo)
                console.log('✅ QR code email sent successfully to:', email)
            } catch (emailError) {
                console.error('❌ Failed to send QR code email:', emailError)
                console.error('❌ Email error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace')
                // Don't fail registration if email fails
            }
        } else {
            console.log('⚠️ No email provided, skipping QR code email')
            console.log('⚠️ Email value received:', email)
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
            message: `Customer ${name} registered successfully with first visit recorded!`
        })

    } catch (error) {
        console.error('❌ Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}