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
        const { businessId, planType = 'monthly' } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        // Get business details
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        // Initialize Razorpay
        const Razorpay = require('razorpay')
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })

        // Create Razorpay order
        const amount = 49900 // ₹499 in paise
        const currency = 'INR'

        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt: `receipt_${businessId}_${Date.now()}`,
            notes: {
                business_id: businessId,
                business_name: business.name,
                plan_type: planType
            }
        })

        // Store payment record
        const { data: payment, error: paymentError } = await supabaseAdmin
            .from('payments')
            .insert({
                business_id: businessId,
                razorpay_order_id: order.id,
                amount: amount / 100, // Store in rupees
                currency,
                status: 'created',
                plan_type: planType,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (paymentError) {
            console.error('Error storing payment:', paymentError)
            return NextResponse.json(
                { error: 'Failed to create payment record' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            order_id: order.id,
            amount,
            currency,
            key: process.env.RAZORPAY_KEY_ID,
            business_name: business.name,
            business_email: business.email,
            payment_id: payment.id
        })

    } catch (error) {
        console.error('Create payment error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}