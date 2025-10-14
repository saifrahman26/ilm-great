import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        console.log('🔑 Testing Resend API key...')

        // Check if API key exists
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'RESEND_API_KEY environment variable is not set'
            }, { status: 500 })
        }

        console.log('🔑 API key found, length:', apiKey.length)
        console.log('🔑 API key starts with:', apiKey.substring(0, 10) + '...')

        // Test the API key by making a simple request to Resend
        const response = await fetch('https://api.resend.com/domains', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        })

        const result = await response.json()

        console.log('📡 Resend API response status:', response.status)
        console.log('📡 Resend API response:', result)

        if (response.ok) {
            return NextResponse.json({
                success: true,
                message: 'Resend API key is valid',
                status: response.status,
                domains: result
            })
        } else {
            return NextResponse.json({
                success: false,
                error: 'Invalid Resend API key',
                status: response.status,
                details: result
            }, { status: 400 })
        }

    } catch (error) {
        console.error('❌ Error testing Resend API key:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to test API key',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}