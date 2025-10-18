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

        if (rewardError || !reward) {
            return NextResponse.json(
                { error: 'Invalid token or reward already claimed' },
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