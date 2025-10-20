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
        // Test 1: Check Razorpay credentials
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

        console.log('Razorpay Key ID:', razorpayKeyId ? 'Set' : 'Not set')
        console.log('Razorpay Key Secret:', razorpayKeySecret ? 'Set' : 'Not set')

        // Test 2: Check if Razorpay package works
        let razorpayTest = null
        try {
            const Razorpay = require('razorpay')
            const razorpay = new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            })
            razorpayTest = 'Razorpay initialized successfully'
        } catch (error) {
            razorpayTest = `Razorpay error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }

        // Test 3: Check if payments table exists
        let paymentsTableTest = null
        try {
            const { data, error } = await supabaseAdmin
                .from('payments')
                .select('*')
                .limit(1)

            if (error) {
                paymentsTableTest = `Payments table error: ${error.message}`
            } else {
                paymentsTableTest = 'Payments table exists and accessible'
            }
        } catch (error) {
            paymentsTableTest = `Payments table test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }

        // Test 4: Try to create a test order (without saving to DB)
        let orderTest = null
        try {
            const Razorpay = require('razorpay')
            const razorpay = new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            })

            const order = await razorpay.orders.create({
                amount: 49900,
                currency: 'INR',
                receipt: `test_receipt_${Date.now()}`,
                notes: {
                    test: 'true'
                }
            })

            orderTest = `Order created successfully: ${order.id}`
        } catch (error) {
            orderTest = `Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }

        return NextResponse.json({
            success: true,
            tests: {
                razorpay_credentials: {
                    key_id_set: !!razorpayKeyId,
                    key_secret_set: !!razorpayKeySecret,
                    key_id_preview: razorpayKeyId ? `${razorpayKeyId.substring(0, 10)}...` : 'Not set'
                },
                razorpay_initialization: razorpayTest,
                payments_table: paymentsTableTest,
                order_creation: orderTest
            }
        })

    } catch (error) {
        console.error('Payment debug error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
}