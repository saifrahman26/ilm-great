import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            business_id
        } = await request.json()

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !business_id) {
            return NextResponse.json(
                { error: 'Missing required payment verification data' },
                { status: 400 }
            )
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Update payment record
        const { data: payment, error: paymentError } = await supabaseAdmin
            .from('payments')
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: 'completed',
                paid_at: new Date().toISOString()
            })
            .eq('razorpay_order_id', razorpay_order_id)
            .eq('business_id', business_id)
            .select()
            .single()

        if (paymentError) {
            console.error('Error updating payment:', paymentError)
            return NextResponse.json(
                { error: 'Failed to update payment record' },
                { status: 500 }
            )
        }

        // Update business subscription
        const subscriptionEndDate = new Date()
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1) // Add 1 month

        const { error: businessError } = await supabaseAdmin
            .from('businesses')
            .update({
                subscription_status: 'active',
                subscription_end_date: subscriptionEndDate.toISOString(),
                last_payment_date: new Date().toISOString()
            })
            .eq('id', business_id)

        if (businessError) {
            console.error('Error updating business subscription:', businessError)
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            payment,
            subscription_end_date: subscriptionEndDate.toISOString()
        })

    } catch (error) {
        console.error('Verify payment error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}