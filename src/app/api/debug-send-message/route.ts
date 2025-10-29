import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        console.log('🔍 Debug send-message request:')
        console.log('📝 Request body:', JSON.stringify(body, null, 2))
        console.log('📧 Email provided:', !!body.email)
        console.log('💬 Message provided:', !!body.message)
        console.log('🏷️ Template:', body.template)

        return NextResponse.json({
            success: true,
            debug: {
                bodyKeys: Object.keys(body),
                hasEmail: !!body.email,
                hasMessage: !!body.message,
                template: body.template,
                fullBody: body
            }
        })
    } catch (error) {
        console.error('❌ Debug error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}