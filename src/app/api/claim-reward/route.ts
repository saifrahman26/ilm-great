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
        const { token, businessId } = await request.json()

        if (!token || !businessId) {
            return NextResponse.json(
                { error: 'Token and Business ID are required' },
                { status: 400 }
            )
        }

        console.log('🔍 Looking for reward with token:', token, 'businessId:', businessId)

        // First, let's check if the rewards table exists and what rewards are available
        const { data: allRewards, error: allRewardsError } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .eq('business_id', businessId)

        console.log('📊 All rewards for business:', allRewards?.length || 0, 'Error:', allRewardsError?.message)

        if (allRewards) {
            console.log('🎫 Available tokens:', allRewards.map(r => ({ token: r.claim_token, status: r.status, customer_id: r.customer_id })))
        }

        // Find the reward by token
        const { data: reward, error: rewardError } = await supabaseAdmin
            .from('rewards')
            .select(`
                *,
                customers (
                    id,
                    name,
                    phone,
                    email,
                    visits
                )
            `)
            .eq('claim_token', token)
            .eq('business_id', businessId)
            .eq('status', 'pending')
            .single()

        console.log('🎯 Specific reward lookup:', {
            token,
            businessId,
            error: rewardError?.message,
            rewardFound: !!reward,
            rewardData: reward ? { id: reward.id, status: reward.status, customer_id: reward.customer_id } : null
        })

        if (rewardError || !reward) {
            // Check if token exists but with different status
            const { data: anyTokenReward } = await supabaseAdmin
                .from('rewards')
                .select('*')
                .eq('claim_token', token)
                .eq('business_id', businessId)
                .single()

            if (anyTokenReward) {
                console.log('🔄 Token found but status is:', anyTokenReward.status)
                if (anyTokenReward.status === 'completed') {
                    return NextResponse.json(
                        { error: 'This reward has already been claimed.' },
                        { status: 400 }
                    )
                }
            }

            if (rewardError?.message?.includes('relation') || rewardError?.message?.includes('does not exist')) {
                return NextResponse.json(
                    { error: 'Rewards system not properly configured. Please contact support.' },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { error: 'Invalid token. Please check the 6-digit code and try again.' },
                { status: 404 }
            )
        }

        // Mark reward as claimed
        const { data: claimedReward, error: claimError } = await supabaseAdmin
            .from('rewards')
            .update({
                status: 'completed',
                redeemed_at: new Date().toISOString()
            })
            .eq('id', reward.id)
            .select()
            .single()

        if (claimError) {
            console.error('Error claiming reward:', claimError)
            return NextResponse.json(
                { error: 'Failed to claim reward' },
                { status: 500 }
            )
        }

        // Reset customer visits to 0 (they start earning towards next reward)
        const { error: resetError } = await supabaseAdmin
            .from('customers')
            .update({ visits: 0 })
            .eq('id', reward.customer_id)

        if (resetError) {
            console.error('Error resetting customer visits:', resetError)
        }

        return NextResponse.json({
            success: true,
            reward: claimedReward,
            customer: reward.customers,
            message: `Reward claimed successfully for ${reward.customers.name}`
        })

    } catch (error) {
        console.error('Claim reward error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}