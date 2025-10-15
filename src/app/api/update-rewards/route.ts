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

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Update rewards API called')

        const { businessId, reward_title, reward_description, visit_goal, userId } = await request.json()

        console.log('📝 Request data:', { businessId, reward_title, reward_description, visit_goal, userId })

        if (!businessId || !userId) {
            return NextResponse.json({ error: 'Business ID and User ID are required' }, { status: 400 })
        }

        // First verify the user owns this business
        const { data: business, error: fetchError } = await supabaseAdmin
            .from('businesses')
            .select('id, name')
            .eq('id', businessId)
            .single()

        if (fetchError || !business) {
            console.error('❌ Business not found:', fetchError)
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }

        console.log('✅ Found business:', business.name)

        // Update the business with new reward settings
        const { data: updatedBusiness, error: updateError } = await supabaseAdmin
            .from('businesses')
            .update({
                reward_title,
                reward_description,
                visit_goal,
                reward_setup_completed: true
            })
            .eq('id', businessId)
            .select()
            .single()

        if (updateError) {
            console.error('❌ Update error:', updateError)
            return NextResponse.json({
                error: 'Failed to update rewards',
                details: updateError.message
            }, { status: 500 })
        }

        console.log('✅ Business updated successfully:', updatedBusiness.id)

        return NextResponse.json({
            success: true,
            message: 'Rewards updated successfully',
            business: updatedBusiness
        })

    } catch (error) {
        console.error('❌ Update rewards API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}