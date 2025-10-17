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
        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        // Update business with default reward setup
        const { data, error } = await supabaseAdmin
            .from('businesses')
            .update({
                reward_title: 'VIP Treatment',
                reward_description: 'Get a special reward after completing your visits!',
                visit_goal: 8,
                reward_setup_completed: true,
                setup_completed_at: new Date().toISOString()
            })
            .eq('id', businessId)
            .select()
            .single()

        if (error) {
            console.error('Error completing setup:', error)
            return NextResponse.json(
                { error: 'Failed to complete setup', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Business setup completed successfully!',
            business: data
        })

    } catch (error) {
        console.error('Auto-complete setup error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Auto-complete setup API',
        usage: 'POST with businessId to complete setup automatically'
    })
}