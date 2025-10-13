import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Create admin client for database operations
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

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const { email, businessName } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // For security, we'll always send a success response even if user doesn't exist
        // This prevents email enumeration attacks
        let finalBusinessName = businessName || 'Business Owner'

        // Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        // Store the reset token in the database using admin client
        const { error: tokenError } = await supabaseAdmin
            .from('password_reset_tokens')
            .insert({
                email,
                token: resetToken,
                expires_at: expiresAt.toISOString(),
                used: false
            })

        if (tokenError) {
            console.error('Error storing reset token:', tokenError)
            return NextResponse.json(
                { error: 'Failed to generate reset token' },
                { status: 500 }
            )
        }

        // Create the reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

        // Send the email
        const { error: emailError } = await resend.emails.send({
            from: 'LoyalLink <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset Your Password - LoyalLink',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${finalBusinessName},</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            We received a request to reset your password for your LoyalLink account. 
                            Click the button below to create a new password:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                            If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="font-size: 14px; color: #007bff; word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 5px;">
                            ${resetUrl}
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                <strong>Security Notice:</strong>
                            </p>
                            <ul style="font-size: 14px; color: #666; margin: 0; padding-left: 20px;">
                                <li>This link will expire in 1 hour</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password won't change until you create a new one</li>
                            </ul>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #666;">
                            <p>Need help? Contact us at support@yourdomain.com</p>
                            <p style="margin-top: 20px;">
                                Best regards,<br>
                                <strong>The LoyalLink Team</strong>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        })

        if (emailError) {
            console.error('Error sending email:', emailError)
            return NextResponse.json(
                { error: 'Failed to send reset email' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Password reset error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}