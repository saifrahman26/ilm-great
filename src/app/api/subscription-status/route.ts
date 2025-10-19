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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const businessId = searchParams.get('businessId')

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        // Get business subscription details
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

        const now = new Date()
        const createdAt = new Date(business.created_at)
        const trialEndDate = new Date(createdAt)
        trialEndDate.setDate(trialEndDate.getDate() + 15) // 15 days trial

        // Check subscription status
        let status = 'trial'
        let daysLeft = 0
        let isExpired = false

        if (business.subscription_status === 'active' && business.subscription_end_date) {
            const subscriptionEndDate = new Date(business.subscription_end_date)
            if (now <= subscriptionEndDate) {
                status = 'active'
                daysLeft = Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            } else {
                status = 'expired'
                isExpired = true
            }
        } else {
            // Check trial status
            if (now <= trialEndDate) {
                status = 'trial'
                daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            } else {
                status = 'trial_expired'
                isExpired = true
            }
        }

        return NextResponse.json({
            success: true,
            business_id: businessId,
            business_name: business.name,
            status,
            days_left: daysLeft,
            is_expired: isExpired,
            trial_end_date: trialEndDate.toISOString(),
            subscription_end_date: business.subscription_end_date,
            last_payment_date: business.last_payment_date,
            created_at: business.created_at
        })

    } catch (error) {
        console.error('Subscription status error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}