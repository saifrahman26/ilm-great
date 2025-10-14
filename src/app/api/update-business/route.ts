import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
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
        const { businessId, reward_title, reward_description, visit_goal } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        // Update business record using service role
        const { data, error } = await supabaseAdmin
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

        if (error) {
            console.error('❌ Business update error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        console.log('✅ Business updated successfully:', data.id)
        return NextResponse.json({
            success: true,
            business: data,
            message: 'Business updated successfully'
        })

    } catch (error) {
        console.error('❌ Update business API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}