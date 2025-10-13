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
        console.log('🔍 Debugging database connection...')

        const results: any = {
            environment: {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
                serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
            },
            tests: {}
        }

        // Test 1: Check if we can connect to Supabase
        try {
            const { data, error } = await supabaseAdmin
                .from('businesses')
                .select('count', { count: 'exact', head: true })

            results.tests.connectionTest = {
                success: !error,
                error: error?.message,
                count: data
            }
        } catch (err) {
            results.tests.connectionTest = {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error'
            }
        }

        // Test 2: Try to insert a simple test record
        try {
            const testId = '00000000-0000-4000-8000-000000000001'
            const { data, error } = await supabaseAdmin
                .from('businesses')
                .upsert({
                    id: testId,
                    name: 'Debug Test Business',
                    email: 'debug@test.com',
                    phone: '+1234567890',
                    reward_title: 'Test Reward',
                    reward_description: 'Test Description',
                    visit_goal: 5,
                    created_at: new Date().toISOString()
                })
                .select()

            results.tests.insertTest = {
                success: !error,
                error: error?.message,
                data: data
            }

            // Clean up test record
            if (!error) {
                await supabaseAdmin
                    .from('businesses')
                    .delete()
                    .eq('id', testId)
            }
        } catch (err) {
            results.tests.insertTest = {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error'
            }
        }

        // Test 3: Check table structure
        try {
            const { data, error } = await supabaseAdmin
                .rpc('get_table_info', { table_name: 'businesses' })
                .single()

            results.tests.tableStructure = {
                success: !error,
                error: error?.message,
                data: data
            }
        } catch (err) {
            results.tests.tableStructure = {
                success: false,
                error: 'RPC function not available or table structure check failed'
            }
        }

        return NextResponse.json({
            success: true,
            results: results,
            message: 'Database debug completed'
        })

    } catch (error) {
        console.error('❌ Database debug error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to debug database',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}