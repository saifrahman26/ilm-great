import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        if (!process.env.BREVO_API_KEY) {
            return NextResponse.json(
                { error: 'BREVO_API_KEY is not configured' },
                { status: 500 }
            )
        }

        console.log('🔍 Checking Brevo sender verification status...')

        // Check sender verification status
        const response = await fetch('https://api.brevo.com/v3/senders', {
            method: 'GET',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            }
        })

        const result = await response.json()

        console.log('📥 Brevo senders response:', result)

        if (response.ok) {
            return NextResponse.json({
                success: true,
                senders: result.senders || [],
                currentSenderEmail: process.env.BREVO_SENDER_EMAIL,
                message: 'Sender verification status retrieved'
            })
        } else {
            console.error('❌ Brevo API error:', result)
            return NextResponse.json(
                {
                    error: 'Failed to check sender status',
                    details: result,
                    status: response.status
                },
                { status: response.status }
            )
        }
    } catch (error) {
        console.error('💥 Error checking Brevo senders:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}