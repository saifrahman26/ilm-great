import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for business creation
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
    console.log('🏢 Create business API called')

    try {
        const body = await request.json()
        const { userId, businessData } = body

        console.log('📝 Request data:', { userId, businessData })

        // Validate input
        if (!userId) {
            console.log('❌ Missing userId')
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (!businessData || !businessData.name || !businessData.email || !businessData.phone) {
            console.log('❌ Missing required business fields')
            return NextResponse.json({
                error: 'Business name, email, and phone are required'
            }, { status: 400 })
        }

        // Try to create business directly (simpler approach)
        console.log('🏢 Creating business...')

        const businessRecord = {
            id: userId,
            name: businessData.name,
            email: businessData.email,
            phone: businessData.phone,
            reward_title: businessData.reward_title || '',
            reward_description: businessData.reward_description || '',
            visit_goal: businessData.visit_goal || 5,
            reward_setup_completed: businessData.reward_setup_completed || false,
            business_logo_url: businessData.business_logo_url || null
        }

        const { data: newBusiness, error: createError } = await supabaseAdmin
            .from('businesses')
            .upsert(businessRecord, {
                onConflict: 'id',
                ignoreDuplicates: false
            })
            .select()
            .single()

        if (createError) {
            console.error('❌ Error creating/updating business:', createError)
            return NextResponse.json({
                error: `Database error: ${createError.message}`,
                details: createError
            }, { status: 500 })
        }

        console.log('✅ Business created/updated successfully:', newBusiness?.id)

        return NextResponse.json({
            success: true,
            business: newBusiness,
            message: 'Business created successfully'
        })

    } catch (error) {
        console.error('❌ Create business error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}