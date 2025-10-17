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
        console.log('📝 Request body:', JSON.stringify(requestBody, null, 2))

        const { businessId, name, phone, email, businessName, rewardTitle, visitGoal } = requestBody

        console.log('🔍 Parsed data:', { businessId, name, phone, email, businessName, rewardTitle, visitGoal })

        if (!businessId || !name || !phone) {
            console.log('❌ Missing required fields')
            return NextResponse.json(
                { error: 'Business ID, name, and phone are required' },
                { status: 400 }
            )
        }

        // Fetch business information
        console.log('🏢 Fetching business information...')
        const { data: businessData, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('name, reward_title, visit_goal')
            .eq('id', businessId)
            .single()

        let actualBusinessName = businessName || 'Business'
        let actualRewardTitle = rewardTitle || 'Loyalty Reward'
        let actualVisitGoal = visitGoal || 5

        if (businessData && !businessError) {
            actualBusinessName = businessData.name
            actualRewardTitle = businessData.reward_title
            actualVisitGoal = businessData.visit_goal
            console.log('✅ Business info loaded:', businessData)
        } else {
            console.log('⚠️ Could not load business info, using defaults. Error:', businessError)
        }

        // Test Supabase connection
        console.log('🔗 Testing Supabase connection...')
        const { data: testData, error: testError } = await supabaseAdmin
            .from('businesses')
            .select('count')
            .limit(1)

        if (testError) {
            console.error('❌ Supabase connection failed:', testError)
            return NextResponse.json(
                { error: 'Database connection failed', details: testError.message },
                { status: 500 }
            )
        } else {
            console.log('✅ Supabase connection successful')
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

            // Update existing customer with new email if provided
            const updateData: any = {
                visits: existingCustomer.visits + 1,
                last_visit: new Date().toISOString()
            }

            // Only update email if it's provided and different from existing
            if (email?.trim() && email.trim() !== existingCustomer.email) {
                updateData.email = email.trim()
                console.log('📧 Updating email for existing customer')
            }

            // Update name if it's different (in case of typos or name changes)
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

            // Send QR code email if email was added/updated
            if (email?.trim() && email.trim() !== existingCustomer.email) {
                console.log('📧 Sending QR code email to updated email address...')
                try {
                    const customerWithQR = {
                        ...updatedCustomer,
                        qr_code_url: existingCustomer.qr_code_url,
                        qr_data: existingCustomer.qr_data
                    }

                    const businessInfo = {
                        name: actualBusinessName,
                        rewardTitle: actualRewardTitle,
                        visitGoal: actualVisitGoal
                    }

                    const { sendQRCodeToCustomer } = await import('@/lib/messaging')
                    await sendQRCodeToCustomer(customerWithQR, businessInfo)
                    console.log('✅ QR code email sent to updated email address')
                } catch (emailError) {
                    console.error('❌ Failed to send QR code email:', emailError)
                }
            }

            return NextResponse.json({
                success: true,
                customer: updatedCustomer,
                message: `Welcome back ${name}! Visit recorded and information updated.`,
                isExistingCustomer: true,
                businessName: actualBusinessName,
                rewardTitle: actualRewardTitle,
                visitGoal: actualVisitGoal
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

        // Generate QR code with customer ID that links to mark-visit page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const qrData = `${baseUrl}/mark-visit/${customer.id}`
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
                    name: actualBusinessName,
                    rewardTitle: actualRewardTitle,
                    visitGoal: actualVisitGoal
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
            message: `Customer ${name} registered successfully with first visit recorded!`,
            businessName: actualBusinessName,
            rewardTitle: actualRewardTitle,
            visitGoal: actualVisitGoal
        })

    } catch (error) {
        console.error('❌ Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}