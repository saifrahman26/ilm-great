import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        console.log('🧪 Testing database connection...')

        // Test basic connection
        const { data, error } = await supabase
            .from('businesses')
            .select('id, name')
            .limit(1)

        if (error) {
            console.error('❌ Database error:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            })
        }

        console.log('✅ Database connection successful')
        return NextResponse.json({
            success: true,
            message: 'Database connection working',
            data: data
        })

    } catch (error) {
        console.error('❌ Exception:', error)
        return NextResponse.json({
            success: false,
            error: 'Exception occurred',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}