import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
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
    context: { params: Promise<{ customerId: string }> }
) {
    const params = await context.params
    try {
        const customerId = params.customerId

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        // Fetch customer data
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('id, name, business_id, qr_code_url, qr_data')
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            console.error('Error fetching customer:', customerError)
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Fetch business data for QR code generation
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('name')
            .eq('id', customer.business_id)
            .single()

        if (businessError || !business) {
            console.error('Error fetching business:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        // Generate or get QR code URL
        let qrCodeUrl = customer.qr_code_url
        if (!qrCodeUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loyallinkk.vercel.app'
            const qrData = `${baseUrl}/mark-visit/${customer.id}`
            qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`

            // Update customer with QR code info
            await supabaseAdmin
                .from('customers')
                .update({
                    qr_code_url: qrCodeUrl,
                    qr_data: qrData
                })
                .eq('id', customer.id)
        }

        try {
            // Fetch the QR code image
            const qrResponse = await fetch(qrCodeUrl)
            if (!qrResponse.ok) {
                throw new Error('Failed to fetch QR code image')
            }

            const qrImageBuffer = await qrResponse.arrayBuffer()

            // Set headers for file download
            const headers = new Headers()
            headers.set('Content-Type', 'image/png')
            headers.set('Content-Disposition', `attachment; filename="${customer.name.replace(/\s+/g, '-')}-loyalty-qr.png"`)
            headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

            return new NextResponse(qrImageBuffer, {
                status: 200,
                headers
            })

        } catch (fetchError) {
            console.error('Error fetching QR code image:', fetchError)

            // Fallback: redirect to QR code URL
            return NextResponse.redirect(qrCodeUrl)
        }

    } catch (error) {
        console.error('Error in QR download API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}