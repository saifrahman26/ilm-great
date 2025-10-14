import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for customer registration
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
    console.log('🧪 Debug register API called')

    try {
        const requestBody = await request.json()
        console.log('📝 Request body:', requestBody)

        // Test environment variables
        const envCheck = {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing',
            resendKey: process.env.RESEND_API_KEY ? 'Present' : 'Missing'
        }

        console.log('🔧 Environment variables:', envCheck)

        // Test database connection
        const { data: testData, error: testError } = await supabaseAdmin
            .from('businesses')
            .select('id, name')
            .limit(1)

        console.log('🗄️ Database test:', { testData, testError })

        // Simple customer creation test (without actual insertion)
        const testCustomer = {
            business_id: requestBody.businessId || 'test-business-id',
            name: requestBody.name || 'Test Customer',
            phone: requestBody.phone || '+1234567890',
            email: requestBody.email || null,
            visits: 1,
            last_visit: new Date().toISOString(),
            created_at: new Date().toISOString()
        }

        console.log('👤 Test customer object:', testCustomer)

        return NextResponse.json({
            success: true,
            message: 'Debug completed successfully',
            debug: {
                environmentVariables: envCheck,
                databaseConnection: testError ? 'Failed' : 'Success',
                databaseError: testError?.message || null,
                testCustomer: testCustomer,
                requestReceived: requestBody
            }
        })

    } catch (error) {
        console.error('❌ Debug register error:', error)
        return NextResponse.json({
            success: false,
            error: 'Debug failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : null
        }, { status: 500 })
    }
}