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
        // Test if rewards table exists by trying to select from it
        const { data, error } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .limit(1)

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                tableExists: false,
                message: 'Rewards table does not exist or is not accessible'
            })
        }

        return NextResponse.json({
            success: true,
            tableExists: true,
            recordCount: data?.length || 0,
            message: 'Rewards table exists and is accessible'
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            tableExists: false
        })
    }
}