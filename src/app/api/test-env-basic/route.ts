import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    console.log('🔍 Environment check API called')

    const envCheck = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        gmailUser: process.env.GMAIL_USER ? 'Set' : 'Missing',
        gmailPassword: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    }

    console.log('📊 Environment check:', envCheck)

    return NextResponse.json(envCheck)
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        console.log('📧 Testing Gmail SMTP...')

        const nodemailer = require('nodemailer')

        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER || 'loyallinkk@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD || 'jeoy gdhp idsl mzzd'
            }
        })

        const info = await transporter.sendMail({
            from: '"LoyalLink Test" <loyallinkk@gmail.com>',
            to: email,
            subject: '✅ Gmail SMTP Test - Working!',
            html: `
                <h2>🎉 Gmail SMTP Test Successful!</h2>
                <p>This email was sent from loyallinkk@gmail.com using Gmail SMTP.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p>Your email service is working! 🚀</p>
            `
        })

        console.log('✅ Email sent successfully!')

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully via Gmail SMTP!'
        })

    } catch (error) {
        console.error('❌ Email error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}