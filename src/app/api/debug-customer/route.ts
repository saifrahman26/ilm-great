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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get('id')

        if (!customerId) {
            // Get all customers if no ID provided
            const { data: customers, error } = await supabaseAdmin
                .from('customers')
                .select('id, name, phone, visits, business_id, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            return NextResponse.json({
                success: true,
                count: customers?.length || 0,
                customers: customers || []
            })
        }

        // Get specific customer
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                code: error.code
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            customer: customer
        })

    } catch (error) {
        console.error('❌ Debug customer error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to debug customer',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}