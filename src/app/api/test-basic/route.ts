import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    console.log('🧪 Basic test API called')

    try {
        const body = await request.json()
        console.log('📝 Received data:', body)

        return NextResponse.json({
            success: true,
            message: 'Basic API working',
            receivedData: body,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('❌ Basic test error:', error)
        return NextResponse.json({
            success: false,
            error: 'Basic test failed',
            details: error instanceof Error ? error.message : 'Unknown'
        })
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Basic test API is working',
        timestamp: new Date().toISOString()
    })
}