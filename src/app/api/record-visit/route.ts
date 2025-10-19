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

export async function POST(request: NextRequest) {
    console.log('🚀 Record visit API called')

    try {
        const requestBody = await request.json()
        console.log('📥 Received request body:', requestBody)

        const { customerId, businessId } = requestBody

        console.log('🔍 Extracted values:', {
            customerId,
            businessId,
            customerIdType: typeof customerId,
            businessIdType: typeof businessId,
            customerIdTruthy: !!customerId,
            businessIdTruthy: !!businessId
        })

        if (!customerId || !businessId) {
            console.log('❌ Missing required fields')
            console.log('❌ Detailed check:', {
                customerId: customerId,
                businessId: businessId,
                customerIdString: String(customerId),
                businessIdString: String(businessId),
                customerIdLength: customerId?.length,
                businessIdLength: businessId?.length,
                customerIdEmpty: customerId === '',
                businessIdEmpty: businessId === '',
                customerIdNull: customerId === null,
                businessIdNull: businessId === null,
                customerIdUndefined: customerId === undefined,
                businessIdUndefined: businessId === undefined
            })
            return NextResponse.json(
                {
                    error: 'Customer ID and Business ID are required',
                    debug: {
                        customerId: customerId,
                        businessId: businessId,
                        customerIdType: typeof customerId,
                        businessIdType: typeof businessId
                    }
                },
                { status: 400 }
            )
        }

        // Get customer details
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .eq('business_id', businessId)
            .single()

        if (customerError || !customer) {
            console.error('❌ Customer not found:', customerError)
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Get business details
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            console.error('❌ Business not found:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        // Update customer visit count
        const newVisitCount = customer.visits + 1
        const { data: updatedCustomer, error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
                visits: newVisitCount,
                last_visit: new Date().toISOString()
            })
            .eq('id', customerId)
            .select()
            .single()

        if (updateError) {
            console.error('❌ Error updating customer:', updateError)
            return NextResponse.json(
                { error: 'Failed to update customer' },
                { status: 500 }
            )
        }

        // Record the visit in visits table
        const { error: visitError } = await supabaseAdmin
            .from('visits')
            .insert({
                business_id: businessId,
                customer_id: customerId,
                visit_date: new Date().toISOString(),
                points_earned: 1,
                notes: `Visit #${newVisitCount} recorded`,
                created_at: new Date().toISOString()
            })

        if (visitError) {
            console.error('❌ Error recording visit:', visitError)
        }

        // Send visit confirmation email if customer has email
        if (customer.email?.trim()) {
            console.log('📧 Sending visit confirmation email...')
            try {
                const { sendVisitConfirmationEmail } = await import('@/lib/messaging')
                await sendVisitConfirmationEmail(
                    updatedCustomer,
                    business,
                    newVisitCount
                )
                console.log('✅ Visit confirmation email sent')
            } catch (emailError) {
                console.error('❌ Failed to send visit email:', emailError)
                // Don't fail the visit recording if email fails
            }
        }

        // Check if customer reached reward goal
        const reachedGoal = newVisitCount >= business.visit_goal
        if (reachedGoal) {
            console.log('🎉 Customer reached reward goal!')

            // Generate reward token instead of sending completion email
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                const tokenResponse = await fetch(`${baseUrl}/api/generate-reward-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerId: customerId,
                        businessId: businessId
                    })
                })

                const tokenResult = await tokenResponse.json()
                if (tokenResponse.ok) {
                    console.log('✅ Reward token generated:', tokenResult.token)
                } else {
                    console.error('❌ Failed to generate reward token:', tokenResult.error)
                }
            } catch (tokenError) {
                console.error('❌ Error generating reward token:', tokenError)
            }
        }

        return NextResponse.json({
            success: true,
            customer: updatedCustomer,
            visits: newVisitCount,
            reachedGoal,
            message: reachedGoal
                ? `🎉 Congratulations! ${customer.name} has earned a reward!`
                : `Visit recorded! ${customer.name} has ${newVisitCount} of ${business.visit_goal} visits.`
        })

    } catch (error) {
        console.error('❌ Record visit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
