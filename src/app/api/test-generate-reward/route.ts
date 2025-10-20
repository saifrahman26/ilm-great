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
        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        // Get business info
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

        // Get a customer from this business for testing
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .limit(1)
            .single()

        if (customerError || !customer) {
            return NextResponse.json(
                { error: 'No customers found for this business. Please add a customer first.' },
                { status: 404 }
            )
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

        // Create test reward record
        const { data: reward, error: rewardError } = await supabaseAdmin
            .from('rewards')
            .insert({
                customer_id: customer.id,
                business_id: businessId,
                reward_title: business.reward_title || 'Test Reward',
                points_used: business.visit_goal || 5,
                claim_token: token,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (rewardError) {
            console.error('Error creating test reward:', rewardError)
            return NextResponse.json(
                { error: 'Failed to create test reward: ' + rewardError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            reward,
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email
            },
            message: 'Test reward token generated successfully'
        })

    } catch (error) {
        console.error('Generate test reward token error:', error)
        return NextResponse.json(
            { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        )
    }
}