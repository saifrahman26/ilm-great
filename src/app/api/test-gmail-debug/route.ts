import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        console.log('🔍 Gmail Debug Test Starting...')
        console.log('🔑 Gmail user:', process.env.GMAIL_USER)
        console.log('🔑 Gmail password configured:', process.env.GMAIL_APP_PASSWORD ? 'Yes' : 'No')
        console.log('🔑 Gmail password length:', process.env.GMAIL_APP_PASSWORD?.length || 0)
        console.log('🔑 Gmail password value:', process.env.GMAIL_APP_PASSWORD)

        // Test nodemailer import
        const nodemailer = require('nodemailer')
        console.log('✅ Nodemailer imported successfully')

        // Create Gmail transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER || 'loyallinkk@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD || 'jeoy gdhp idsl mzzd'
            }
        })
        console.log('✅ Transporter created')

        // Test connection
        console.log('📤 Testing Gmail connection...')
        await transporter.verify()
        console.log('✅ Gmail connection verified!')

        // Send test email
        const info = await transporter.sendMail({
            from: '"LoyalLink Debug" <loyallinkk@gmail.com>',
            to: email || 'warriorsaifdurer@gmail.com',
            subject: '🔧 Gmail Debug Test - Direct',
            html: '<h1>Gmail SMTP Test</h1><p>This is a direct Gmail SMTP test!</p>',
            text: 'Gmail SMTP Test - This is a direct Gmail SMTP test!'
        })

        console.log('✅ Email sent via Gmail!')
        console.log('📧 Message ID:', info.messageId)

        return NextResponse.json({
            success: true,
            message: 'Gmail SMTP working perfectly!',
            service: 'gmail_debug',
            messageId: info.messageId,
            response: info.response,
            debug: {
                accepted: info.accepted,
                rejected: info.rejected,
                gmailUser: process.env.GMAIL_USER,
                hasPassword: !!process.env.GMAIL_APP_PASSWORD
            }
        })

    } catch (error) {
        console.error('❌ Gmail Debug Error:', error)

        return NextResponse.json({
            success: false,
            message: 'Gmail SMTP failed in debug test',
            service: 'gmail_debug_error',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            debug: {
                gmailUser: process.env.GMAIL_USER,
                hasPassword: !!process.env.GMAIL_APP_PASSWORD,
                passwordLength: process.env.GMAIL_APP_PASSWORD?.length || 0,
                nodeEnv: process.env.NODE_ENV
            }
        })
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Gmail Debug Test Endpoint',
        usage: 'POST with { "email": "test@example.com" }'
    })
}