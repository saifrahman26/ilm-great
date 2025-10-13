import { NextResponse } from 'next/server'

export async function GET() {
    try {
        console.log('🏥 Health check called')

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            env: {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
                supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
            }
        })
    } catch (error) {
        console.error('❌ Health check error:', error)
        return NextResponse.json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}