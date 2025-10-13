import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Create admin client for user management
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
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            )
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Check if token exists and is valid
        const { data: tokenData, error: tokenError } = await supabaseAdmin
            .from('password_reset_tokens')
            .select('email, expires_at, used')
            .eq('token', token)
            .single()

        if (tokenError || !tokenData) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 400 }
            )
        }

        // Check if token has expired or been used
        const now = new Date()
        const expiresAt = new Date(tokenData.expires_at)

        if (now > expiresAt || tokenData.used) {
            return NextResponse.json(
                { error: 'Token has expired or already been used' },
                { status: 400 }
            )
        }

        // Get user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()

        if (userError) {
            console.error('Error fetching users:', userError)
            return NextResponse.json(
                { error: 'Failed to find user' },
                { status: 500 }
            )
        }

        const user = userData.users.find(u => u.email === tokenData.email)

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Update user password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password }
        )

        if (updateError) {
            console.error('Error updating password:', updateError)
            return NextResponse.json(
                { error: 'Failed to update password' },
                { status: 500 }
            )
        }

        // Mark token as used
        const { error: markUsedError } = await supabaseAdmin
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('token', token)

        if (markUsedError) {
            console.error('Error marking token as used:', markUsedError)
            // Don't fail the request if we can't mark the token as used
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Password reset error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}