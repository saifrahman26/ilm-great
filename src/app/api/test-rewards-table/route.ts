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

export async function GET() {
    try {
        console.log('🔍 Testing rewards table...')

        // Try to query the rewards table
        const { data, error } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Rewards table error:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                tableExists: false
            })
        }

        console.log('✅ Rewards table exists:', data)
        return NextResponse.json({
            success: true,
            tableExists: true,
            sampleData: data
        })

    } catch (error) {
        console.error('❌ Test rewards table error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}