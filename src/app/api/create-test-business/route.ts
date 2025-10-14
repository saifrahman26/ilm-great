import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🏢 Creating test business...')

        // Create a test business
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .insert({
                id: 'bba780b3-bde5-4647-9e74-68bcfdb6e903', // Use the ID from logs
                name: 'My Business',
                email: 'test@mybusiness.com',
                phone: '+1234567890',
                reward_title: 'Free Coffee',
                reward_description: 'Get a free coffee on us!',
                visit_goal: 5
            })
            .select()
            .single()

        if (businessError) {
            console.error('❌ Error creating test business:', businessError)
            return NextResponse.json({
                success: false,
                error: businessError.message
            }, { status: 500 })
        }

        console.log('✅ Test business created:', business)

        // Generate the join URL and QR code
        const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer-register/${business.id}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`

        return NextResponse.json({
            success: true,
            business: business,
            joinUrl: joinUrl,
            qrCodeUrl: qrCodeUrl,
            testInstructions: {
                businessQrCode: qrCodeUrl,
                joinPage: joinUrl,
                businessApi: `/api/business/${business.id}`,
                qrCodePage: `/qr-code`
            }
        })

    } catch (error) {
        console.error('❌ Test business creation error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to create test business',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}