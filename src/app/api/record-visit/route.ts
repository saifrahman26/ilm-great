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

        console.log(`🔍 Visit Analysis:`)
        console.log(`   - Customer: ${customer.name}`)
        console.log(`   - Customer email: ${customer.email}`)
        console.log(`   - Current visits: ${customer.visits}`)
        console.log(`   - New visit count: ${newVisitCount}`)
        console.log(`   - Visit goal: ${business.visit_goal}`)
        console.log(`   - Modulo calculation: ${newVisitCount} % ${business.visit_goal} = ${newVisitCount % business.visit_goal}`)
        console.log(`   - Reached goal: ${reachedGoal}`)
        console.log(`   - Reward number: ${rewardNumber}`)
        console.log(`   - Business reward title: ${business.reward_title}`)

        // Send visit confirmation email if customer has email (but not if they reached reward goal)
        if (customer.email?.trim() && !reachedGoal) {
            console.log('📧 Sending visit confirmation email (no reward reached)...')
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
        } else if (customer.email?.trim() && reachedGoal) {
            console.log('🎯 Skipping visit confirmation email because reward was reached - reward email will be sent instead')
        } else if (!customer.email?.trim()) {
            console.log('⚠️ No email address for customer, skipping visit confirmation email')
        }

        if (reachedGoal) {
            console.log('🎉🎉🎉 REWARD MILESTONE REACHED! 🎉🎉🎉')
            console.log(`   - Customer: ${customer.name}`)
            console.log(`   - Email: ${customer.email}`)
            console.log(`   - Visit count: ${newVisitCount}`)
            console.log(`   - Visit goal: ${business.visit_goal}`)
            console.log(`   - Reward #${rewardNumber}`)
            console.log(`   - Business: ${business.name}`)
            console.log(`   - Reward title: ${business.reward_title}`)

            // Check if reward already exists for this exact visit milestone to prevent duplicates
            // Only check for very recent duplicates (within 10 minutes) to avoid blocking legitimate rewards
            const { data: existingReward } = await supabaseAdmin
                .from('rewards')
                .select('id, created_at')
                .eq('customer_id', customerId)
                .eq('status', 'pending')
                .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Within last 10 minutes only
                .single()

            if (existingReward) {
                console.log('⚠️ Very recent reward exists (within 10 minutes), skipping duplicate')
                console.log('⚠️ Existing reward created at:', existingReward.created_at)
                console.log('⚠️ Current time:', new Date().toISOString())
                return NextResponse.json({
                    success: true,
                    customer: updatedCustomer,
                    visits: newVisitCount,
                    reachedGoal,
                    message: `Visit recorded! ${customer.name} already has a pending reward.`
                })
            } else {
                console.log('✅ No recent duplicate rewards found, proceeding with reward creation')
            }

            // Generate reward token directly here instead of separate API call
            try {
                // Generate a unique 6-digit token
                const generateRewardToken = () => Math.floor(100000 + Math.random() * 900000).toString()
                let token = generateRewardToken()

                // Save reward token to database for claim validation
                try {
                    const { data: reward, error: rewardError } = await supabaseAdmin
                        .from('rewards')
                        .insert({
                            customer_id: customerId,
                            business_id: businessId,
                            reward_title: business.reward_title,
                            points_used: business.visit_goal,
                            claim_token: token,
                            status: 'pending',
                            created_at: new Date().toISOString()
                        })
                        .select()
                        .single()

                    if (rewardError) {
                        console.log('⚠️ Could not save reward to database (table might not exist):', rewardError.message)
                        // Continue anyway - we'll still send the email
                    } else {
                        console.log('✅ Reward record created:', reward.id)
                    }
                } catch (dbError) {
                    console.log('⚠️ Rewards table not available, continuing with email only')
                }

                // Send reward token email directly
                if (customer.email?.trim()) {
                    console.log('🎁🎁🎁 SENDING REWARD EMAIL 🎁🎁🎁')
                    console.log('🎁 REWARD EMAIL: Customer:', customer.name)
                    console.log('🎁 REWARD EMAIL: Email address:', customer.email)
                    console.log('🎁 REWARD EMAIL: Token:', token)
                    console.log('🎁 REWARD EMAIL: Reward title:', business.reward_title)
                    console.log('🎁 REWARD EMAIL: Business:', business.name)
                    try {
                        const { sendRewardTokenEmail } = await import('@/lib/messaging')
                        await sendRewardTokenEmail(updatedCustomer, business, token)
                        console.log('✅ REWARD EMAIL: Reward token email sent successfully!')
                    } catch (emailError) {
                        console.error('❌ REWARD EMAIL: Failed to send reward token email:', emailError)
                        console.error('❌ REWARD EMAIL: Email error details:', JSON.stringify(emailError, null, 2))
                    }
                } else {
                    console.log('⚠️ REWARD EMAIL: No email address for customer, skipping reward email')
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
