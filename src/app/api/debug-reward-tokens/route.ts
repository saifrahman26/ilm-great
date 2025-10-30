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
        console.log('🔍 Debugging reward tokens...')

        // Get all rewards with customer and business info
        const { data: rewards, error: rewardsError } = await supabaseAdmin
            .from('rewards')
            .select(`
                id,
                claim_token,
                status,
                reward_title,
                points_used,
                created_at,
                claimed_at,
                customer_id,
                business_id,
                customers!inner(name, email),
                businesses!inner(name)
            `)
            .order('created_at', { ascending: false })
            .limit(20)

        if (rewardsError) {
            console.error('❌ Error fetching rewards:', rewardsError)
            return NextResponse.json({
                success: false,
                error: 'Could not fetch rewards',
                details: rewardsError
            })
        }

        console.log('✅ Found', rewards?.length || 0, 'rewards')

        // Format the rewards data
        const formattedRewards = rewards?.map(reward => ({
            id: reward.id,
            claim_token: reward.claim_token,
            status: reward.status,
            reward_title: reward.reward_title,
            points_used: reward.points_used,
            created_at: reward.created_at,
            claimed_at: reward.claimed_at,
            customer_name: reward.customers?.name,
            customer_email: reward.customers?.email,
            business_name: reward.businesses?.name,
            customer_id: reward.customer_id,
            business_id: reward.business_id
        })) || []

        // Group by status
        const pendingRewards = formattedRewards.filter(r => r.status === 'pending')
        const claimedRewards = formattedRewards.filter(r => r.status === 'claimed')

        return NextResponse.json({
            success: true,
            message: `Found ${rewards?.length || 0} rewards in database`,
            summary: {
                total: rewards?.length || 0,
                pending: pendingRewards.length,
                claimed: claimedRewards.length
            },
            rewards: formattedRewards,
            pendingTokens: pendingRewards.map(r => r.claim_token),
            claimedTokens: claimedRewards.map(r => r.claim_token)
        })

    } catch (error) {
        console.error('❌ Debug reward tokens error:', error)
        return NextResponse.json({
            success: false,
            error: 'Debug failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}