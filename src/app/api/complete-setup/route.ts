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
    console.log('✅ Complete setup API called')

    try {
        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        console.log('🏢 Marking setup as complete for business:', businessId)

        // Update business to mark setup as complete with default values
        const { data: updatedBusiness, error: updateError } = await supabaseAdmin
            .from('businesses')
            .update({
                reward_title: 'Loyalty Reward',
                reward_description: 'Thank you for being a loyal customer!',
                visit_goal: 5,
                reward_setup_completed: true
            })
            .eq('id', businessId)
            .select()
            .single()

        if (updateError) {
            console.error('❌ Error completing setup:', updateError)
            return NextResponse.json(
                { error: `Failed to complete setup: ${updateError.message}` },
                { status: 500 }
            )
        }

        console.log('✅ Setup completed successfully for business:', businessId)

        return NextResponse.json({
            success: true,
            business: updatedBusiness,
            message: 'Setup completed successfully'
        })

    } catch (error) {
        console.error('❌ Complete setup error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}