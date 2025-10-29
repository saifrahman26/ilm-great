import { Customer } from './supabase'
import { aiService } from './ai'

// Generate AI-powered message content
async function generateAIMessage(context: {
    businessName: string
    businessType?: string
    customerName: string
    visitCount: number
    visitGoal: number
    rewardTitle: string
    isRewardReached: boolean
    emailType: 'visit_confirmation' | 'reward_earned' | 'inactive_reminder'
}): Promise<string> {
    try {
        const aiResponse = await aiService.generatePersonalizedEmail(context)

        if (aiResponse.success && aiResponse.content) {
            return aiResponse.content
        }
    } catch (error) {
        console.log('AI message generation failed, using fallback:', error)
    }

    // Fallback to default messages
    switch (context.emailType) {
        case 'visit_confirmation':
            if (context.isRewardReached) {
                return `🎉 Amazing! You've completed ${context.visitCount} visits and earned your <strong>${context.rewardTitle}</strong>! Show this email at your next visit to claim it.`
            } else {
                return `Thank you for your visit! You now have <strong>${context.visitCount} of ${context.visitGoal}</strong> visits. Keep going to earn your <strong>${context.rewardTitle}</strong>!`
            }
        case 'reward_earned':
            return `🎉 Congratulations! You've earned your <strong>${context.rewardTitle}</strong>! Show this email to claim your reward.`
        case 'inactive_reminder':
            return `We miss you! Come back to ${context.businessName} and continue your journey to earn your <strong>${context.rewardTitle}</strong>!`
        default:
            return `Thank you for being a valued customer at ${context.businessName}!`
    }
}

// Generate QR code using QR Server API
export async function generateQRCode(data: string): Promise<string> {
    try {
        // Using QR Server API (free service)
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
    } catch (error) {
        console.error('Error generating QR code:', error)
        return ''
    }
}

// WhatsApp messaging using UltraMsg API
export async function sendWhatsAppMessage(customer: Customer, message: string): Promise<boolean> {
    try {
        const response = await fetch(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                token: process.env.ULTRAMSG_TOKEN!,
                to: customer.phone || '',
                body: message,
                priority: '1',
                referenceId: `loyalty_${Date.now()}`
            })
        })

        return response.ok
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
    visitCount: number,
    rewardExpires: boolean = false,
    rewardExpiryMonths: number = 1
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