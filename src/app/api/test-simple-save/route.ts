import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Simple save test started...')

        const body = await request.json()
        console.log('📝 Received data:', body)

        // Just return success without any database operations
        return NextResponse.json({
            success: true,
            message: 'Simple test successful',
            receivedData: body
        })

    } catch (error) {
        console.error('❌ Simple save test error:', error)
        return NextResponse.json({
            error: 'Simple test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}