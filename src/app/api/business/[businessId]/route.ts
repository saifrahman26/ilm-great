import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for business lookup
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ businessId: string }> }
) {
    try {
        const { businessId } = await params

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        console.log('🏢 Fetching business:', businessId)

        // Fetch business information using admin client
        const { data: business, error } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (error) {
            console.error('❌ Error fetching business:', error)
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    {
                        error: 'Business not found',
                        message: 'This business does not exist or has not been set up yet.',
                        suggestion: 'Please contact the business owner to ensure their loyalty program is properly configured.'
                    },
                    { status: 404 }
                )
            }
            return NextResponse.json(
                {
                    error: 'Failed to fetch business',
                    details: error.message
                },
                { status: 500 }
            )
        }

        if (!business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        console.log('✅ Business found:', business.name)

        return NextResponse.json({
            success: true,
            business
        })

    } catch (error) {
        console.error('❌ Business API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}