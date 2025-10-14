import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    console.log('🔗 Auth callback handler called')

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('📝 Callback params:', { code: code ? 'present' : 'missing', next })

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        try {
            console.log('🔄 Exchanging code for session...')
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('❌ Auth callback error:', error)
                return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
            }

            console.log('✅ Auth callback successful:', data.user?.id)

            // Redirect to dashboard or specified next URL
            return NextResponse.redirect(`${origin}${next}`)

        } catch (err) {
            console.error('❌ Auth callback exception:', err)
            return NextResponse.redirect(`${origin}/login?error=auth_callback_exception`)
        }
    }

    console.log('⚠️ No auth code provided, redirecting to login')
    return NextResponse.redirect(`${origin}/login?error=no_auth_code`)
}