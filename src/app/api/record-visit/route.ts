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

        let { customerId, businessId } = requestBody

        console.log('🔍 Processing visit for customer:', customerId, 'business:', businessId)

        // Validate required fields
        if (!customerId || customerId === 'null' || customerId === 'undefined') {
            return NextResponse.json(
                { error: 'Valid Customer ID is required' },
                { status: 400 }
            )
        }

        if (!businessId || businessId === 'null' || businessId === 'undefined') {
            return NextResponse.json(
                { error: 'Valid Business ID is required' },
                { status: 400 }
            )
        }

        // Get customer details (first try with business_id match, then without)
        let customer, customerError

        // Try to find customer with business_id match first
        const customerQuery1 = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .eq('business_id', businessId)
            .single()

        if (customerQuery1.data) {
            customer = customerQuery1.data
        } else {
            // If not found, try without business_id constraint and use customer's business_id
            console.log('🔄 Customer not found with business_id match, trying without constraint...')
            const customerQuery2 = await supabaseAdmin
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single()

            if (customerQuery2.data) {
                customer = customerQuery2.data
                // Update businessId to match customer's actual business_id
                businessId = customer.business_id
                console.log('✅ Using customer business_id:', businessId)
            } else {
                customerError = customerQuery2.error
            }
        }

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

        // Check if customer reached reward goal (only at exact multiples)
        const reachedGoal = newVisitCount > 0 && newVisitCount % business.visit_goal === 0
        const rewardNumber = reachedGoal ? newVisitCount / business.visit_goal : 0

        // Send visit confirmation email if customer has email (but not if they reached reward goal)
        if (customer.email?.trim() && !reachedGoal) {
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

        if (reachedGoal) {
            console.log('🎉 Customer reached reward milestone!')

            // Generate reward token directly here instead of separate API call
            try {
                // Generate a unique 6-digit token
                const generateRewardToken = () => Math.floor(100000 + Math.random() * 900000).toString()
                let token = generateRewardToken()

                // Send reward token email directly
                if (customer.email?.trim()) {
                    try {
                        const { sendRewardTokenEmail } = await import('@/lib/messaging')
                        await sendRewardTokenEmail(updatedCustomer, business, token, rewardNumber)
                    } catch (emailError) {
                        console.error('❌ Failed to send reward token email:', emailError)
                    }
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
                ? `🎉 Congratulations! ${customer.name} has earned their ${rewardNumber}${rewardNumber === 1 ? 'st' : rewardNumber === 2 ? 'nd' : rewardNumber === 3 ? 'rd' : 'th'} reward!`
                : `Visit recorded! ${customer.name} has ${newVisitCount} visit${newVisitCount === 1 ? '' : 's'}. ${Math.ceil(newVisitCount / business.visit_goal) * business.visit_goal - newVisitCount} more to next reward.`
        })

    } catch (error) {
        console.error('❌ Record visit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
