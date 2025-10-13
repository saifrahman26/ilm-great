import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
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
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }

        // Check if token exists and is valid
        const { data: tokenData, error } = await supabaseAdmin
            .from('password_reset_tokens')
            .select('email, expires_at, used')
            .eq('token', token)
            .single()

        if (error || !tokenData) {
            return NextResponse.json({ valid: false })
        }

        // Check if token has expired
        const now = new Date()
        const expiresAt = new Date(tokenData.expires_at)

        if (now > expiresAt || tokenData.used) {
            return NextResponse.json({ valid: false })
        }

        return NextResponse.json({
            valid: true,
            email: tokenData.email
        })
    } catch (error) {
        console.error('Token validation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}