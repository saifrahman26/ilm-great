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

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Testing rewards table...')

        // Test 1: Check if table exists
        const { data: tableTest, error: tableError } = await supabaseAdmin
            .from('rewards')
            .select('count')
            .limit(1)

        if (tableError) {
            console.error('❌ Rewards table error:', tableError)
            return NextResponse.json({
                success: false,
                error: 'Rewards table does not exist or is not accessible',
                details: tableError
            })
        }

        console.log('✅ Rewards table exists')

        // Test 2: List existing rewards
        const { data: existingRewards, error: listError } = await supabaseAdmin
            .from('rewards')
            .select('id, claim_token, status, created_at, customer_id, business_id, reward_title')
            .order('created_at', { ascending: false })
            .limit(10)

        if (listError) {
            console.error('❌ Error listing rewards:', listError)
            return NextResponse.json({
                success: false,
                error: 'Could not list existing rewards',
                details: listError
            })
        }

        console.log('✅ Found', existingRewards?.length || 0, 'existing rewards')

        // Test 3: Get a real customer and business ID for testing
        const { data: sampleCustomer } = await supabaseAdmin
            .from('customers')
            .select('id, business_id')
            .limit(1)
            .single()

        if (!sampleCustomer) {
            return NextResponse.json({
                success: false,
                error: 'No customers found in database - need at least one customer to test rewards',
                existingRewards: existingRewards?.length || 0
            })
        }

        console.log('✅ Using sample customer:', sampleCustomer.id, 'business:', sampleCustomer.business_id)

        // Test 3: Create a test reward with real UUIDs
        const testToken = 'TEST' + Math.floor(100000 + Math.random() * 900000).toString()

        const { data: testReward, error: createError } = await supabaseAdmin
            .from('rewards')
            .insert({
                customer_id: sampleCustomer.id,
                business_id: sampleCustomer.business_id,
                reward_title: 'Test Reward',
                points_used: 5,
                claim_token: testToken,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (createError) {
            console.error('❌ Error creating test reward:', createError)
            return NextResponse.json({
                success: false,
                error: 'Could not create test reward',
                details: createError,
                existingRewards: existingRewards?.length || 0
            })
        }

        console.log('✅ Test reward created:', testReward.id)

        // Test 4: Retrieve the test reward by token
        const { data: retrievedReward, error: retrieveError } = await supabaseAdmin
            .from('rewards')
            .select('*')
            .eq('claim_token', testToken)
            .single()

        if (retrieveError || !retrievedReward) {
            console.error('❌ Error retrieving test reward:', retrieveError)
            return NextResponse.json({
                success: false,
                error: 'Could not retrieve test reward by token',
                details: retrieveError,
                testToken,
                existingRewards: existingRewards?.length || 0
            })
        }

        console.log('✅ Test reward retrieved successfully')

        // Test 5: Clean up - delete test reward
        const { error: deleteError } = await supabaseAdmin
            .from('rewards')
            .delete()
            .eq('id', testReward.id)

        if (deleteError) {
            console.warn('⚠️ Could not delete test reward:', deleteError)
        } else {
            console.log('✅ Test reward cleaned up')
        }

        return NextResponse.json({
            success: true,
            message: 'Rewards table is working correctly',
            testResults: {
                tableExists: true,
                existingRewardsCount: existingRewards?.length || 0,
                testRewardCreated: true,
                testRewardRetrieved: true,
                testToken: testToken,
                testRewardId: testReward.id
            },
            existingRewards: existingRewards?.map(r => ({
                id: r.id,
                token: r.claim_token,
                status: r.status,
                title: r.reward_title,
                created: r.created_at
            })) || []
        })

    } catch (error) {
        console.error('❌ Test rewards table error:', error)
        return NextResponse.json({
            success: false,
            error: 'Test failed with exception',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}