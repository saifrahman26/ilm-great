import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('🏢 Setting up demo business...')

        // Create the specific business that's being referenced
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .upsert({
                id: 'bba780b3-bde5-4647-9e74-68bcfdb6e903',
                name: 'Demo Coffee Shop',
                email: 'demo@coffeeshop.com',
                phone: '+1234567890',
                reward_title: 'Free Coffee',
                reward_description: 'Get a free coffee on us after 5 visits!',
                visit_goal: 5,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (businessError) {
            console.error('❌ Error creating demo business:', businessError)
            return NextResponse.json({
                success: false,
                error: businessError.message,
                details: businessError
            }, { status: 500 })
        }

        console.log('✅ Demo business created:', business)

        // Generate the URLs
        const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer-register/${business.id}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`

        return NextResponse.json({
            success: true,
            message: 'Demo business created successfully!',
            business: business,
            urls: {
                joinUrl: joinUrl,
                qrCodeUrl: qrCodeUrl,
                businessApi: `/api/business/${business.id}`,
                dashboard: `/dashboard`
            },
            instructions: {
                step1: `Visit ${joinUrl} to test customer registration`,
                step2: 'Fill out the registration form as a customer',
                step3: 'Check email for personal QR code',
                step4: 'Use /scanner to scan customer QR codes'
            }
        })

    } catch (error) {
        console.error('❌ Demo business setup error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to setup demo business',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}