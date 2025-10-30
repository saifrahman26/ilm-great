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

        console.log('📊 Fetching offer campaigns for business:', businessId)

        const { data: campaigns, error } = await supabaseAdmin
            .from('offer_campaigns')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('❌ Error fetching campaigns:', error)
            return NextResponse.json(
                { error: 'Failed to fetch campaigns' },
                { status: 500 }
            )
        }

        console.log('✅ Campaigns fetched:', campaigns?.length || 0)

        return NextResponse.json({
            success: true,
            campaigns: campaigns || []
        })

    } catch (error) {
        console.error('❌ Fetch campaigns error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}