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
    try {
        const { customerId, businessId } = await request.json()

        console.log('🔍 DEBUG: Starting reward flow debug...')
        console.log('🔍 DEBUG: Customer ID:', customerId)
        console.log('🔍 DEBUG: Business ID:', businessId)

        // Get customer details
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json({
                error: 'Customer not found',
                details: { customerError, customerId }
            }, { status: 404 })
        }

        // Get business details
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json({
                error: 'Business not found',
                details: { businessError, businessId }
            }, { status: 404 })
        }

        // Simulate visit increment
        const newVisitCount = customer.visits + 1
        const reachedGoal = newVisitCount > 0 && newVisitCount % business.visit_goal === 0
        const rewardNumber = reachedGoal ? newVisitCount / business.visit_goal : 0

        console.log('🔍 DEBUG: Visit Analysis:')
        console.log('   - Customer:', customer.name)
        console.log('   - Customer email:', customer.email)
        console.log('   - Current visits:', customer.visits)
        console.log('   - New visit count:', newVisitCount)
        console.log('   - Visit goal:', business.visit_goal)
        console.log('   - Reached goal:', reachedGoal)
        console.log('   - Reward number:', rewardNumber)
        console.log('   - Modulo calculation:', newVisitCount % business.visit_goal)

        // Check if rewards table exists
        let rewardsTableExists = false
        try {
            const { data: testReward } = await supabaseAdmin
                .from('rewards')
                .select('id')
                .limit(1)
            rewardsTableExists = true
            console.log('✅ DEBUG: Rewards table exists')
        } catch (tableError) {
            console.log('❌ DEBUG: Rewards table does not exist:', tableError)
        }

        // Check for existing rewards
        let existingReward = null
        if (rewardsTableExists) {
            const { data: existing } = await supabaseAdmin
                .from('rewards')
                .select('*')
                .eq('customer_id', customerId)
                .eq('status', 'pending')

            existingReward = existing
            console.log('🔍 DEBUG: Existing rewards:', existing?.length || 0)
        }

        // Test email sending capability
        let emailTestResult = null
        if (customer.email?.trim() && reachedGoal) {
            console.log('🔍 DEBUG: Testing email sending...')
            try {
                const { sendRewardTokenEmail } = await import('@/lib/messaging')

                // Test with a dummy token
                await sendRewardTokenEmail(customer, business, '999999')
                emailTestResult = { success: true, message: 'Email sent successfully' }
                console.log('✅ DEBUG: Email test successful')
            } catch (emailError) {
                emailTestResult = {
                    success: false,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                    details: emailError
                }
                console.error('❌ DEBUG: Email test failed:', emailError)
            }
        }

        return NextResponse.json({
            success: true,
            debug: {
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    currentVisits: customer.visits,
                    hasEmail: !!customer.email?.trim()
                },
                business: {
                    id: business.id,
                    name: business.name,
                    visitGoal: business.visit_goal,
                    rewardTitle: business.reward_title
                },
                visitAnalysis: {
                    newVisitCount,
                    reachedGoal,
                    rewardNumber,
                    moduloResult: newVisitCount % business.visit_goal
                },
                database: {
                    rewardsTableExists,
                    existingRewards: existingReward?.length || 0
                },
                emailTest: emailTestResult
            }
        })

    } catch (error) {
        console.error('❌ DEBUG: Error in reward flow debug:', error)
        return NextResponse.json({
            error: 'Debug failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}