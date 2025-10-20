import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Check if user exists in auth.users table using admin client
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (authError) {
            console.error('Error checking auth users:', authError)
            return NextResponse.json(
                { exists: false, error: 'Could not check user existence' },
                { status: 500 }
            )
        }

        // Check if email exists in auth users
        const userExists = authUsers.users.some(user => user.email === email)

        if (userExists) {
            return NextResponse.json({ exists: true })
        }

        // Also check businesses table as backup
        const { data: businessUser, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('email')
            .eq('email', email)
            .single()

        const businessExists = businessUser && !businessError

        return NextResponse.json({
            exists: businessExists,
            source: businessExists ? 'businesses' : 'none'
        })

    } catch (error) {
        console.error('Check user exists error:', error)
        return NextResponse.json(
            { exists: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}