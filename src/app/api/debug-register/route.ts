import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        console.log('🐛 Debug register API called')

        const requestBody = await request.json()
        console.log('📝 Request body received:', requestBody)

        // Just return the data without any database operations
        return NextResponse.json({
            success: true,
            message: 'Debug API working',
            receivedData: requestBody,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('❌ Debug API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Debug API failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}