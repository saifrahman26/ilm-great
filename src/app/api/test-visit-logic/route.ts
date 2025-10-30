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

        console.log('🧪 TESTING VISIT LOGIC')
        console.log('🧪 Customer ID:', customerId)
        console.log('🧪 Business ID:', businessId)

        // Get customer
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        // Get business
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }

        // Test the visit logic
        const currentVisits = customer.visits
        const newVisitCount = currentVisits + 1
        const visitGoal = business.visit_goal
        const reachedGoal = newVisitCount > 0 && newVisitCount % visitGoal === 0
        const rewardNumber = reachedGoal ? newVisitCount / visitGoal : 0

        console.log('🧪 VISIT LOGIC TEST:')
        console.log('   - Customer:', customer.name)
        console.log('   - Email:', customer.email)
        console.log('   - Current visits:', currentVisits)
        console.log('   - New visit count:', newVisitCount)
        console.log('   - Visit goal:', visitGoal)
        console.log('   - Modulo calculation:', newVisitCount, '%', visitGoal, '=', newVisitCount % visitGoal)
        console.log('   - Reached goal:', reachedGoal)
        console.log('   - Reward number:', rewardNumber)

        // Test reward email sending (without actually sending)
        if (reachedGoal && customer.email?.trim()) {
            console.log('🧪 WOULD SEND REWARD EMAIL:')
            console.log('   - To:', customer.email)
            console.log('   - Reward:', business.reward_title)
            console.log('   - Business:', business.name)

            // Test the actual email function
            try {
                console.log('🧪 Testing sendRewardTokenEmail function...')
                const { sendRewardTokenEmail } = await import('@/lib/messaging')

                // Generate test token
                const testToken = '999999'

                // Actually send the email for testing
                await sendRewardTokenEmail(customer, business, testToken)
                console.log('✅ TEST EMAIL SENT SUCCESSFULLY!')

                return NextResponse.json({
                    success: true,
                    message: 'Test reward email sent successfully',
                    testData: {
                        customer: customer.name,
                        email: customer.email,
                        currentVisits,
                        newVisitCount,
                        visitGoal,
                        reachedGoal,
                        rewardNumber,
                        testToken
                    }
                })
            } catch (emailError) {
                console.error('❌ TEST EMAIL FAILED:', emailError)
                return NextResponse.json({
                    success: false,
                    error: 'Test email failed',
                    emailError: emailError instanceof Error ? emailError.message : 'Unknown error',
                    testData: {
                        customer: customer.name,
                        email: customer.email,
                        currentVisits,
                        newVisitCount,
                        visitGoal,
                        reachedGoal,
                        rewardNumber
                    }
                })
            }
        } else {
            return NextResponse.json({
                success: true,
                message: reachedGoal ? 'Would reach goal but no email address' : 'Would not reach goal',
                testData: {
                    customer: customer.name,
                    email: customer.email,
                    currentVisits,
                    newVisitCount,
                    visitGoal,
                    reachedGoal,
                    rewardNumber,
                    hasEmail: !!customer.email?.trim()
                }
            })
        }

    } catch (error) {
        console.error('❌ Test visit logic error:', error)
        return NextResponse.json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}