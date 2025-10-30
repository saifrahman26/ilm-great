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

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const params = await context.params
    try {
        const token = params.token

        if (!token) {
            return NextResponse.json(
                { error: 'Reward token is required' },
                { status: 400 }
            )
        }

        console.log('🎁 Looking up reward token:', token)

        // Find reward by token
        const { data: reward, error: rewardError } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .eq('claim_token', token)
            .single()

        if (rewardError || !reward) {
            console.error('❌ Reward not found:', rewardError)
            return NextResponse.json(
                { error: 'Reward token not found or invalid' },
                { status: 404 }
            )
        }

        // Get customer details
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', reward.customer_id)
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
            .eq('id', reward.business_id)
            .single()

        if (businessError || !business) {
            console.error('❌ Business not found:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        console.log('✅ Reward found:', {
            rewardId: reward.id,
            customerName: customer.name,
            businessName: business.name,
            rewardTitle: reward.reward_title,
            status: reward.status
        })

        return NextResponse.json({
            success: true,
            reward,
            customer,
            business
        })

    } catch (error) {
        console.error('❌ Error fetching reward:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const params = await context.params
    try {
        const token = params.token

        if (!token) {
            return NextResponse.json(
                { error: 'Reward token is required' },
                { status: 400 }
            )
        }

        console.log('🎁 Claiming reward with token:', token)

        // Find reward by token
        const { data: reward, error: rewardError } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .eq('claim_token', token)
            .single()

        if (rewardError || !reward) {
            console.error('❌ Reward not found for claiming:', rewardError)
            return NextResponse.json(
                { error: 'Reward token not found or invalid' },
                { status: 404 }
            )
        }

        // Check if already claimed
        if (reward.status === 'claimed') {
            return NextResponse.json(
                { error: 'This reward has already been claimed' },
                { status: 400 }
            )
        }

        // Update reward status to claimed
        const { data: updatedReward, error: updateError } = await supabaseAdmin
            .from('rewards')
            .update({
                status: 'claimed',
                claimed_at: new Date().toISOString()
            })
            .eq('id', reward.id)
            .select()
            .single()

        if (updateError) {
            console.error('❌ Error updating reward status:', updateError)
            return NextResponse.json(
                { error: 'Failed to claim reward' },
                { status: 500 }
            )
        }

        console.log('✅ Reward claimed successfully:', {
            rewardId: reward.id,
            customerId: reward.customer_id,
            businessId: reward.business_id,
            claimedAt: updatedReward.claimed_at
        })

        return NextResponse.json({
            success: true,
            message: 'Reward claimed successfully',
            reward: updatedReward
        })

    } catch (error) {
        console.error('❌ Error claiming reward:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}