import { NextRequest, NextResponse } from 'next/server'
import { whatsappService } from '@/whatsapp'

export async function POST(request: NextRequest) {
    try {
        const {
            phone,
            message,
            customerName,
            businessName,
            points,
            totalPoints,
            currentVisits,
            visitGoal,
            type = 'simple'
        } = await request.json()

        if (!phone) {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            )
        }

        console.log('📱 Sending WhatsApp message...')
        console.log('📞 Phone:', phone)
        console.log('📝 Type:', type)

        let result

        switch (type) {
            case 'loyalty':
                result = await whatsappService.sendLoyaltyUpdate({
                    phone,
                    message: message || '',
                    customerName,
                    businessName,
                    points,
                    totalPoints,
                    currentVisits,
                    visitGoal
                })
                break

            case 'welcome':
                result = await whatsappService.sendWelcomeMessage({
                    phone,
                    message: message || '',
                    customerName,
                    businessName
                })
                break

            case 'reminder':
                result = await whatsappService.sendVisitReminder({
                    phone,
                    message: message || '',
                    customerName,
                    businessName,
                    currentVisits,
                    visitGoal
                })
                break

            default:
                result = await whatsappService.sendMessage({
                    phone,
                    message: message || 'Hello from LoyalLink!',
                    customerName,
                    businessName
                })
        }

        console.log('✅ WhatsApp message sent successfully!')

        return NextResponse.json({
            success: true,
            result,
            message: 'WhatsApp message sent successfully!',
            service: 'whatsapp',
            phone: result.phone
        })

    } catch (error) {
        console.error('❌ WhatsApp error:', error)

        return NextResponse.json({
            success: false,
            message: 'WhatsApp message failed',
            service: 'whatsapp_error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Test endpoint
export async function GET() {
    try {
        const status = await whatsappService.testConnection()

        return NextResponse.json({
            message: 'WhatsApp API Status',
            status,
            usage: 'POST with phone number and message'
        })
    } catch (error) {
        return NextResponse.json({
            message: 'WhatsApp API Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}