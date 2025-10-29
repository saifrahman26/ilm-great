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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get('customerId')

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        // Get customer and business info
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select(`
                *,
                businesses (
                    id,
                    name,
                    business_type,
                    visit_goal,
                    reward_title
                )
            `)
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        const business = customer.businesses

        // Generate enhanced QR code URL with business branding
        const qrData = `https://loyallinkk.vercel.app/mark-visit/${customerId}`
        const enhancedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=4f46e5&margin=20&format=png`

        return NextResponse.json({
            success: true,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                visits: customer.visits || 0
            },
            business: {
                id: business.id,
                name: business.name,
                type: business.business_type,
                visitGoal: business.visit_goal,
                rewardTitle: business.reward_title
            },
            qrCode: {
                url: enhancedQrUrl,
                data: qrData,
                downloadUrl: `${enhancedQrUrl}&download=1`
            }
        })

    } catch (error) {
        console.error('Generate customer QR error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}