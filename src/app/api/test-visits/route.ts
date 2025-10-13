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
    try {
        console.log('🧪 Testing visits table...')

        // Test 1: Check if visits table exists by trying to select from it
        const { data: existingVisits, error: selectError } = await supabaseAdmin
            .from('visits')
            .select('*')
            .limit(1)

        console.log('Select test:', { data: existingVisits, error: selectError })

        // Test 2: Try to insert a test visit
        const testVisit = {
            customer_id: 'e751cdb7-e7c1-4217-b5c5-24fd41a52e51',
            business_id: '6be1dbc3-0832-4617-b143-d7135590374a',
            points_earned: 1,
            visit_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            notes: 'Test visit'
        }

        console.log('Attempting to insert:', testVisit)

        const { data: insertData, error: insertError } = await supabaseAdmin
            .from('visits')
            .insert(testVisit)
            .select()

        console.log('Insert test:', { data: insertData, error: insertError })

        return NextResponse.json({
            success: true,
            tests: {
                selectTest: {
                    success: !selectError,
                    error: selectError?.message,
                    data: existingVisits
                },
                insertTest: {
                    success: !insertError,
                    error: insertError?.message,
                    data: insertData
                }
            }
        })

    } catch (error) {
        console.error('❌ Test visits error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to test visits table',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}