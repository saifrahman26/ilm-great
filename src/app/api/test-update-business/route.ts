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
        console.log('🔍 Testing business update...')

        const { businessId, reward_title, reward_description, visit_goal } = await request.json()

        console.log('📝 Update data:', { businessId, reward_title, reward_description, visit_goal })

        if (!businessId) {
            return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
        }

        // First, check if business exists
        const { data: existingBusiness, error: fetchError } = await supabaseAdmin
            .from('businesses')
            .select('id, business_name, reward_title, reward_description, visit_goal')
            .eq('id', businessId)
            .single()

        if (fetchError) {
            console.error('❌ Fetch error:', fetchError)
            return NextResponse.json({ error: 'Business not found', details: fetchError.message }, { status: 404 })
        }

        console.log('✅ Found business:', existingBusiness)

        // Now try to update
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
                error: 'Update failed',
                details: updateError.message,
                code: updateError.code
            }, { status: 500 })
        }

        console.log('✅ Business updated successfully:', updatedBusiness)

        return NextResponse.json({
            success: true,
            message: 'Business updated successfully',
            before: existingBusiness,
            after: updatedBusiness
        })

    } catch (error) {
        console.error('❌ Test update API error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}