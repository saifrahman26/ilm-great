import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
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
        const { userId, businessData } = await request.json()

        if (!userId || !businessData) {
            return NextResponse.json(
                { error: 'Missing userId or businessData' },
                { status: 400 }
            )
        }

        // Create business record using service role
        const { data, error } = await supabaseAdmin
            .from('businesses')
            .insert({
                id: userId,
                ...businessData,
            })
            .select()
            .single()

        if (error) {
            console.error('❌ Business creation error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        console.log('✅ Business created successfully:', data.id)
        return NextResponse.json({ business: data })

    } catch (error) {
        console.error('❌ Create business API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}