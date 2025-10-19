import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Check environment variables
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

        // Check if Razorpay package is available
        let razorpayAvailable = false
        try {
            const Razorpay = require('razorpay')
            razorpayAvailable = true
        } catch (error) {
            razorpayAvailable = false
        }

        return NextResponse.json({
            success: true,
            debug: {
                razorpay_key_id_set: !!razorpayKeyId,
                razorpay_key_secret_set: !!razorpayKeySecret,
                razorpay_key_id_value: razorpayKeyId ? `${razorpayKeyId.substring(0, 10)}...` : 'Not set',
                razorpay_package_available: razorpayAvailable,
                node_env: process.env.NODE_ENV,
                timestamp: new Date().toISOString()
            }
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
    }
}