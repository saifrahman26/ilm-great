import { NextResponse } from 'next/server'

export async function GET() {
    console.log('🔍 Environment check API called')

    const envCheck = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    }

    console.log('📊 Environment check:', envCheck)

    return NextResponse.json(envCheck)
}