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

// Generate a unique 6-digit token
function generateRewardToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
    try {
        const { customerId, businessId } = await request.json()

        if (!customerId || !businessId) {
            return NextResponse.json(
                { error: 'Customer ID and Business ID are required' },
                { status: 400 }
            )
        }

        // Get customer and business info
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .eq('business_id', businessId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        // Check if customer has enough visits
        if (customer.visits < business.visit_goal) {
            return NextResponse.json(
                { error: 'Customer has not reached reward goal yet' },
                { status: 400 }
            )
        }

        // Check if there's already an unclaimed reward
        const { data: existingReward, error: rewardCheckError } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .eq('customer_id', customerId)
            .eq('business_id', businessId)
            .eq('status', 'pending')
            .single()

        if (existingReward && !rewardCheckError) {
            return NextResponse.json({
                success: true,
                reward: existingReward,
                message: 'Reward token already exists'
            })
        }

        // Generate unique token
        let token = generateRewardToken()
        let tokenExists = true
        let attempts = 0

        // Ensure token is unique
        while (tokenExists && attempts < 10) {
            const { data: existingToken } = await supabaseAdmin
                .from('rewards')
                .select('id')
                .eq('claim_token', token)
                .eq('business_id', businessId)
                .single()

            if (!existingToken) {
                tokenExists = false
            } else {
                token = generateRewardToken()
                attempts++
            }
        }

        // Create reward record
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
            console.error('Error creating reward:', rewardError)
            return NextResponse.json(
                { error: 'Failed to create reward' },
                { status: 500 }
            )
        }

        // Send token email to customer
        if (customer.email) {
            try {
                const { sendRewardTokenEmail } = await import('@/lib/messaging')
                await sendRewardTokenEmail(customer, business, token)
            } catch (emailError) {
                console.error('Failed to send reward token email:', emailError)
            }
        }

        return NextResponse.json({
            success: true,
            reward,
            token,
            message: 'Reward token generated successfully'
        })

    } catch (error) {
        console.error('Generate reward token error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}