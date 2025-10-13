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

export async function GET() {
    try {
        console.log('🔍 Debugging businesses table...')

        // Get all businesses
        const { data: businesses, error } = await supabaseAdmin
            .from('businesses')
            .select('id, name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('❌ Error fetching businesses:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            }, { status: 500 })
        }

        console.log('✅ Found businesses:', businesses?.length || 0)

        return NextResponse.json({
            success: true,
            count: businesses?.length || 0,
            businesses: businesses || [],
            message: 'Businesses fetched successfully'
        })

    } catch (error) {
        console.error('❌ Debug businesses error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to debug businesses',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}