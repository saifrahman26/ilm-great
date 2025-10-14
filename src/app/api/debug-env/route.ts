import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
        nodeEnv: process.env.NODE_ENV || 'Not set'
    })
}