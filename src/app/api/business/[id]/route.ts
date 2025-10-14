import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
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
    { params }: { params: { id: string } }
) {
    try {
        const businessId = params.id

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        console.log('🏢 Fetching business:', businessId)

        // Fetch business data
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError) {
            console.error('❌ Error fetching business:', businessError)
            if (businessError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Business not found' },
                    { status: 404 }
                )
            }
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            )
        }

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        console.log('✅ Business found:', business.name)

        return NextResponse.json({
            success: true,
            business: {
                id: business.id,
                name: business.name,
                reward_title: business.reward_title || 'Loyalty Reward',
                reward_description: business.reward_description || 'Thank you for being a loyal customer!',
                visit_goal: business.visit_goal || 5,
                business_logo_url: business.business_logo_url
            }
        })

    } catch (error) {
        console.error('❌ Error in business API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}