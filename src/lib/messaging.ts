import { Customer } from './supabase'
import { aiService } from './ai'





// Generate QR code using QR Server API
export async function generateQRCode(data: string): Promise<string> {
    try {
        // Using QR Server API (free service)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`
        return qrUrl
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}

// WhatsApp messaging using UltraMsg API
export async function sendWhatsAppMessage(customer: Customer, message: string): Promise<boolean> {
    try {
        const response = await fetch(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: process.env.ULTRAMSG_TOKEN,
                to: customer.phone,
                body: message
            })
        })

        const result = await response.json()
        return response.ok && result.sent
    } catch (error) {
        console.error('Error sending WhatsApp message:', error)
        return false
    }
}

// Legacy email function - now uses the new email service
export async function sendEmail(customer: Customer, subject: string, htmlContent: string): Promise<boolean> {
    try {
        if (!customer.email) {
            console.error('No email address provided for customer:', customer.name)
            return false
        }

        const { sendEmail: newSendEmail } = await import('./email')
        return await newSendEmail(customer.email, subject, htmlContent)
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

// Send visit confirmation email with AI enhancement
export async function sendVisitConfirmationEmail(
    customer: any,
    business: any,
    visitCount: number
): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        // Use AI-enhanced email service
        const { sendAIEnhancedEmail } = await import('./email')

        const isRewardReached = visitCount >= business.visit_goal

        const emailSent = await sendAIEnhancedEmail(
            customer.email,
            customer.name,
            business.name,
            business.business_type || 'Business',
            'visit_confirmation',
            {
                visitCount,
                visitGoal: business.visit_goal,
                rewardTitle: business.reward_title,
                isRewardReached
            }
        )

        if (emailSent) {
            console.log('✅ AI-enhanced visit confirmation email sent to:', customer.email)
        } else {
            console.error('❌ Failed to send visit confirmation email to:', customer.email)
        }
    } catch (error) {
        console.error('❌ Error sending visit confirmation email:', error)
        throw error
    }
}

// Send reward notification with AI enhancement
export async function sendRewardNotification(customer: Customer, business?: any): Promise<void> {
    try {
        const message = `🎉 Congratulations ${customer.name}!\n\nYou've earned your reward after 5 visits! Claim it at your next visit.\n\nThank you for being a loyal customer! ❤️`

        const whatsappSent = await sendWhatsAppMessage(customer, message)

        if (!whatsappSent && customer.email) {
            // Use AI-enhanced email if business info is available
            if (business) {
                const { sendAIEnhancedEmail } = await import('./email')

                await sendAIEnhancedEmail(
                    customer.email,
                    customer.name,
                    business.name || 'Your Business',
                    business.business_type || 'Business',
                    'reward_earned',
                    {
                        rewardTitle: business.reward_title || 'Loyalty Reward',
                        isRewardReached: true
                    }
                )
            } else {
                // Fallback to original email
                const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>🎉 Reward Earned!</h2>
                <p>Hi ${customer.name},</p>
                <p><strong>Congratulations! You've earned your reward after 5 visits!</strong></p>
                <p>Claim your reward at your next visit.</p>
                <p>Thank you for being a loyal customer! ❤️</p>
              </div>
            `

                await sendEmail(customer, '🎉 You\'ve Earned a Reward!', emailHtml)
            }
        }
    } catch (error) {
        console.error('❌ Error sending reward notification:', error)
    }
}

// Send offer to inactive customers
export async function sendInactiveCustomerOffer(customer: Customer, business?: any): Promise<void> {
    try {
        const message = `Hi ${customer.name}! 😊\n\nWe miss you! It's been a while since your last visit.\n\nCome back for a special 20% off offer! Valid for the next 7 days.\n\nShow this message to claim your discount! 🎁`

        const whatsappSent = await sendWhatsAppMessage(customer, message)

        if (!whatsappSent && customer.email) {
            // Use AI-enhanced email if business info is available
            if (business) {
                const { sendAIEnhancedEmail } = await import('./email')

                await sendAIEnhancedEmail(
                    customer.email,
                    customer.name,
                    business.name || 'Your Business',
                    business.business_type || 'Business',
                    'inactive_reminder',
                    {
                        rewardTitle: business.reward_title || 'Loyalty Reward',
                        daysSinceLastVisit: 30,
                        specialOffer: '20% off your next visit'
                    }
                )
            } else {
                // Fallback to original email
                const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>We Miss You! 😊</h2>
                <p>Hi ${customer.name},</p>
                <p>It's been a while since your last visit. We miss you!</p>
                <p><strong>Come back for a special 20% off offer!</strong></p>
                <p>Valid for the next 7 days. Show this message to claim your discount! 🎁</p>
              </div>
            `

                await sendEmail(customer, 'We Miss You - Special 20% Off Offer!', emailHtml)
            }
        }
    } catch (error) {
        console.error('❌ Error sending inactive customer offer:', error)
    }
}

// Send reward token email
export async function sendRewardTokenEmail(customer: any, business: any, token?: string): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        // Generate QR code for the reward token
        const qrCodeUrl = await generateQRCode(`REWARD-${token || 'CLAIM'}-${customer.id}`)

        // Use AI-enhanced email service with premium template
        const { sendPremiumRewardEmail } = await import('./email')

        const emailSent = await sendPremiumRewardEmail(
            customer.email,
            customer.name,
            business.name,
            business.business_type || 'Business',
            {
                rewardTitle: business.reward_title,
                claimToken: token || `REWARD-${Date.now()}`,
                qrCodeUrl,
                businessId: business.id
            }
        )

        if (emailSent) {
            console.log('✅ Premium reward email sent to:', customer.email)
        } else {
            console.error('❌ Failed to send reward email to:', customer.email)
        }
    } catch (error) {
        console.error('❌ Error sending reward email:', error)
        throw error
    }
}

// Send QR code to customer via email API
export async function sendQRCodeToCustomer(customer: Customer, businessInfo?: { name: string; rewardTitle: string; visitGoal: number }): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        const qrCodeUrl = await generateQRCode(`https://loyallinkk.vercel.app/mark-visit/${customer.id}`)

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your QR Code - ${businessInfo?.name || 'LinkLoyal'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">📱 Your QR Code</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${businessInfo?.name || 'LinkLoyal'}</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #4f46e5; margin-top: 0;">Hello ${customer.name}! 👋</h2>
                
                <p>Here's your personal QR code for ${businessInfo?.name || 'our loyalty program'}:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <img src="${qrCodeUrl}" alt="Your QR Code" style="max-width: 200px; border: 3px solid #4f46e5; border-radius: 10px;" />
                </div>
                
                <p><strong>How to use:</strong></p>
                <ul>
                    <li>Show this QR code at your next visit</li>
                    <li>Staff will scan it to record your visit</li>
                    <li>Earn rewards after ${businessInfo?.visitGoal || 5} visits!</li>
                </ul>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
                    <p style="margin: 0; color: #495057; font-size: 14px;">
                        <strong>Reward:</strong> ${businessInfo?.rewardTitle || 'Loyalty Reward'}
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>Powered by 🔗 LinkLoyal - Making loyalty simple and rewarding</p>
            </div>
        </body>
        </html>`

        const emailSent = await sendEmail(customer, '📱 Your QR Code is Ready!', emailHtml)

        if (emailSent) {
            console.log('✅ QR code email sent to:', customer.email)
        } else {
            console.error('❌ Failed to send QR code email to:', customer.email)
        }
    } catch (error) {
        console.error('❌ Error sending QR code email:', error)
        throw error
    }
}

// Send reward completion email
export async function sendRewardCompletionEmail(
    customer: any,
    business: any
): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        // Use AI-enhanced email service
        const { sendAIEnhancedEmail } = await import('./email')

        const emailSent = await sendAIEnhancedEmail(
            customer.email,
            customer.name,
            business.name,
            business.business_type || 'Business',
            'reward_earned',
            {
                rewardTitle: business.reward_title,
                isRewardReached: true
            }
        )

        if (emailSent) {
            console.log('✅ AI-enhanced reward completion email sent to:', customer.email)
        } else {
            console.error('❌ Failed to send reward completion email to:', customer.email)
        }
    } catch (error) {
        console.error('❌ Error sending reward completion email:', error)
        throw error
    }
}