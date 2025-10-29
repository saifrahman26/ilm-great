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

// Helper function to generate branded email header
function generateEmailHeader(businessName: string, businessLogo?: string) {
    return `
        <!-- Enhanced Header with Business Branding -->
        <div class="header" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); padding: 40px; border-radius: 24px 24px 0 0; text-align: center; position: relative; overflow: hidden;">
            <!-- Background Pattern -->
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
            
            <!-- Business Logo or LinkLoyal Logo -->
            <div class="business-logo" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: inline-block; padding: 20px 30px; border-radius: 60px; margin-bottom: 25px; border: 2px solid rgba(255,255,255,0.2);">
                ${businessLogo ?
            `<img src="${businessLogo}" alt="${businessName} Logo" style="height: 40px; max-width: 200px; object-fit: contain;" />` :
            `<h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🔗 ${businessName}</h1>`
        }
            </div>
        </div>
    `
}

// Helper function to generate branded email footer
function generateEmailFooter(businessName: string, businessPhone?: string) {
    return `
        <!-- Enhanced Footer with Business Contact -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <div style="background: rgba(79, 70, 229, 0.1); backdrop-filter: blur(10px); display: inline-block; padding: 20px 30px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(79, 70, 229, 0.2);">
                <p style="margin: 0 0 10px 0; color: #4f46e5; font-size: 18px; font-weight: 700;">
                    ${businessName}
                </p>
                ${businessPhone ?
            `<p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        📞 ${businessPhone}
                    </p>` : ''
        }
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Thank you for your loyalty!
                </p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LoyalLink</strong> - Making loyalty simple and rewarding
            </p>
        </div>
    `
}

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

// Email messaging using Brevo API
export async function sendEmail(customer: Customer, subject: string, htmlContent: string): Promise<boolean> {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: 'LinkLoyal',
                    email: process.env.BREVO_SENDER_EMAIL || 'noreply@loyallink.com'
                },
                to: [
                    {
                        email: customer.email,
                        name: customer.name
                    }
                ],
                subject: `[LinkLoyal] ${subject}`,
                htmlContent: htmlContent,
                textContent: htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
                tags: ['loyalty-program', 'automated']
            })
        })

        return response.ok
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

// Send QR code to customer via email API
export async function sendQRCodeToCustomer(customer: Customer, businessInfo?: { name: string; rewardTitle: string; visitGoal: number }): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        const businessName = businessInfo?.name || 'LinkLoyal Business'
        const rewardTitle = businessInfo?.rewardTitle || 'Loyalty Reward'
        const visitGoal = businessInfo?.visitGoal || 5

        // Create a beautiful LinkLoyal-branded email with QR code
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${businessName} - Your LinkLoyal QR Code</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container { padding: 8px !important; }
            .header { padding: 25px 15px !important; }
            .content { padding: 25px 15px !important; }
            .qr-container { padding: 20px 15px !important; margin: 20px 0 !important; }
            .step-container { flex-direction: column !important; align-items: flex-start !important; }
            .step-number { margin-bottom: 8px !important; margin-right: 0 !important; }
            .reward-info { padding: 20px 15px !important; margin: 20px 0 !important; }
            .how-it-works { padding: 20px 15px !important; margin: 20px 0 !important; }
            .main-title { font-size: 24px !important; line-height: 1.2 !important; }
            .greeting-title { font-size: 22px !important; }
            .qr-image { width: 180px !important; height: 180px !important; }
            .step-text { font-size: 15px !important; line-height: 1.4 !important; }
            .cta-button { padding: 15px 25px !important; font-size: 16px !important; }
        }
        @media only screen and (max-width: 480px) {
            .container { padding: 5px !important; }
            .header { padding: 20px 10px !important; }
            .content { padding: 20px 10px !important; }
            .qr-container { padding: 15px 10px !important; }
            .main-title { font-size: 20px !important; }
            .greeting-title { font-size: 20px !important; }
            .qr-image { width: 160px !important; height: 160px !important; }
            .linkloyal-logo { font-size: 22px !important; padding: 12px 20px !important; }
        }
    </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Enhanced Header with LinkLoyal Branding -->
        <div class="header" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); padding: 40px; border-radius: 24px 24px 0 0; text-align: center; position: relative; overflow: hidden;">
            <!-- Background Pattern -->
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
            
            <!-- LinkLoyal Logo -->
            <div class="linkloyal-logo" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: inline-block; padding: 20px 30px; border-radius: 60px; margin-bottom: 25px; border: 2px solid rgba(255,255,255,0.2);">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    🔗 LinkLoyal
                </h1>
            </div>
            
            <h2 class="main-title" style="color: white; margin: 0; font-size: 48px; font-weight: 900; text-shadow: 0 3px 6px rgba(0,0,0,0.4); line-height: 1.1; letter-spacing: 1.5px;">
                ${businessName}
            </h2>
            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 20px; font-weight: 500; line-height: 1.3;">
                🎉 Welcome to your loyalty program!
            </p>
            
            <!-- Animated dots -->
            <div style="margin-top: 20px;">
                <span style="display: inline-block; width: 8px; height: 8px; background: rgba(255,255,255,0.8); border-radius: 50%; margin: 0 4px; animation: bounce 1.5s infinite;"></span>
                <span style="display: inline-block; width: 8px; height: 8px; background: rgba(255,255,255,0.6); border-radius: 50%; margin: 0 4px; animation: bounce 1.5s infinite 0.2s;"></span>
                <span style="display: inline-block; width: 8px; height: 8px; background: rgba(255,255,255,0.4); border-radius: 50%; margin: 0 4px; animation: bounce 1.5s infinite 0.4s;"></span>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content" style="background: white; padding: 50px; border-radius: 0 0 24px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            
            <!-- Greeting -->
            <div style="text-align: center; margin-bottom: 35px;">
                <h3 class="greeting-title" style="color: #1f2937; font-size: 28px; margin: 0 0 15px 0; font-weight: 700; line-height: 1.2;">
                    Hello ${customer.name}! 👋
                </h3>
                <p style="color: #6b7280; font-size: 17px; margin: 0; line-height: 1.6; max-width: 420px; margin: 0 auto; padding: 0 10px;">
                    Thank you for joining the <strong style="color: #4f46e5;">${businessName}</strong> loyalty program!<br>
                    Here's your personal QR code to start earning rewards.
                </p>
            </div>

            <!-- Enhanced QR Code Section -->
            <div class="qr-container" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px; border-radius: 20px; text-align: center; margin: 40px 0; border: 3px solid #e5e7eb; position: relative;">
                <!-- Decorative corners -->
                <div style="position: absolute; top: 15px; left: 15px; width: 20px; height: 20px; border-top: 3px solid #4f46e5; border-left: 3px solid #4f46e5; border-radius: 4px 0 0 0;"></div>
                <div style="position: absolute; top: 15px; right: 15px; width: 20px; height: 20px; border-top: 3px solid #4f46e5; border-right: 3px solid #4f46e5; border-radius: 0 4px 0 0;"></div>
                <div style="position: absolute; bottom: 15px; left: 15px; width: 20px; height: 20px; border-bottom: 3px solid #4f46e5; border-left: 3px solid #4f46e5; border-radius: 0 0 0 4px;"></div>
                <div style="position: absolute; bottom: 15px; right: 15px; width: 20px; height: 20px; border-bottom: 3px solid #4f46e5; border-right: 3px solid #4f46e5; border-radius: 0 0 4px 0;"></div>
                
                <div style="background: white; display: inline-block; padding: 25px; border-radius: 16px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 2px solid #f1f5f9;">
                    <img class="qr-image" src="${customer.qr_code_url}" alt="Your Personal QR Code" style="width: 220px; height: 220px; border-radius: 12px; display: block;" />
                </div>
                
                <div style="margin-top: 20px;">
                    <p style="color: #4b5563; font-size: 16px; margin: 0; font-weight: 600;">
                        📱 Your Personal QR Code
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 8px 0 0 0; line-height: 1.5;">
                        Show this code at <strong>${businessName}</strong> to earn points<br>
                        <span style="color: #6b7280;">💡 Tip: Save this email or screenshot the QR code!</span>
                    </p>
                </div>
            </div>

            <!-- Enhanced Reward Info -->
            <div class="reward-info" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid #f59e0b; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.1;">🎁</div>
                <div style="display: flex; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; margin-bottom: 10px; font-size: 24px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); flex-shrink: 0;">
                        🎁
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <h4 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 700; line-height: 1.3;">
                            ${rewardTitle}
                        </h4>
                        <p style="color: #b45309; margin: 5px 0 0 0; font-size: 15px; font-weight: 500;">
                            Earn after ${visitGoal} visits
                        </p>
                    </div>
                </div>
            </div>

            <!-- Enhanced How it Works -->
            <div class="how-it-works" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 18px; font-weight: 700; display: flex; align-items: center; line-height: 1.3;">
                    <span style="margin-right: 10px; font-size: 22px;">📋</span>
                    How to use your QR code:
                </h4>
                <div style="color: #0f172a;">
                    <div class="step-container" style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 8px 0;">
                        <span class="step-number" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 13px; font-weight: bold; box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3); flex-shrink: 0;">1</span>
                        <span class="step-text" style="font-size: 15px; font-weight: 500; line-height: 1.4;">Show this QR code when you visit <strong>${businessName}</strong></span>
                    </div>
                    <div class="step-container" style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 8px 0;">
                        <span class="step-number" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 13px; font-weight: bold; box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3); flex-shrink: 0;">2</span>
                        <span class="step-text" style="font-size: 15px; font-weight: 500; line-height: 1.4;">Staff will scan it to automatically record your visit</span>
                    </div>
                    <div class="step-container" style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 8px 0;">
                        <span class="step-number" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 13px; font-weight: bold; box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3); flex-shrink: 0;">3</span>
                        <span class="step-text" style="font-size: 15px; font-weight: 500; line-height: 1.4;">Earn points with each visit - no manual tracking needed!</span>
                    </div>
                    <div class="step-container" style="display: flex; align-items: flex-start; padding: 8px 0;">
                        <span class="step-number" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 13px; font-weight: bold; box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3); flex-shrink: 0;">4</span>
                        <span class="step-text" style="font-size: 15px; font-weight: 500; line-height: 1.4;">Get your <strong>${rewardTitle}</strong> after ${visitGoal} visits! 🎉</span>
                    </div>
                </div>
            </div>

            <!-- Enhanced Call to Action -->
            <div style="text-align: center; margin: 35px 0;">
                <div class="cta-button" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 18px 35px; border-radius: 50px; display: inline-block; font-weight: 700; font-size: 17px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); border: 2px solid rgba(255,255,255,0.2); line-height: 1.2;">
                    💾 Save this email for easy access!
                </div>
                <p style="color: #6b7280; font-size: 13px; margin: 12px 0 0 0; padding: 0 15px; line-height: 1.4;">
                    You can also bookmark this email or take a screenshot
                </p>
            </div>
        </div>

        <!-- Enhanced Footer -->
        <div style="text-align: center; padding: 30px; color: rgba(255,255,255,0.9);">
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.2);">
                <p style="margin: 0; font-size: 16px; font-weight: 600;">
                    Powered by <strong>🔗 LinkLoyal</strong>
                </p>
            </div>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                Making loyalty simple and rewarding
            </p>
            <p style="margin: 10px 0 0 0; font-size: 13px; opacity: 0.7;">
                Visit <strong>${businessName}</strong> and start earning rewards today!
            </p>
        </div>
    </div>
</body>
</html>`

        // Get the base URL for API calls
        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

        console.log('📧 Sending QR code email to:', customer.email)
        console.log('🌐 Using base URL:', baseUrl)

        const response = await fetch(`${baseUrl}/api/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: customer.email,
                message: emailHtml,
                subject: `🔗 Welcome to ${businessName} - Your LinkLoyal QR Code Inside!`,
                template: 'raw-html'
            })
        })

        console.log('📧 Email API response status:', response.status)

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to send QR code email: ${errorData.error || 'Unknown error'}`)
        }

        console.log('QR code email sent successfully to:', customer.email)
    } catch (error) {
        console.error('Error sending QR code email:', error)
        throw error
    }
}

// Send reward notification
export async function sendRewardNotification(customer: Customer): Promise<void> {
    const message = `🎉 Congratulations ${customer.name}!\n\nYou've earned your reward after 5 visits! Claim it at your next visit.\n\nThank you for being a loyal customer! ❤️`

    const whatsappSent = await sendWhatsAppMessage(customer, message)

    if (!whatsappSent && customer.email) {
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

// Send offer to inactive customers
export async function sendInactiveCustomerOffer(customer: Customer): Promise<void> {
    const message = `Hi ${customer.name}! 😊\n\nWe miss you! It's been a while since your last visit.\n\nCome back for a special 20% off offer! Valid for the next 7 days.\n\nShow this message to claim your discount! 🎁`

    const whatsappSent = await sendWhatsAppMessage(customer, message)

    if (!whatsappSent && customer.email) {
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>We Miss You! 😊</h2>
        <p>Hi ${customer.name},</p>
        <p>It's been a while since your last visit, and we miss you!</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1;">Special Offer: 20% Off!</h3>
          <p>Come back and enjoy 20% off your next purchase!</p>
          <p><strong>Valid for the next 7 days.</strong></p>
        </div>
        <p>Show this email to claim your discount! 🎁</p>
      </div>
    `

        await sendEmail(customer, 'We Miss You - Special 20% Off Offer!', emailHtml)
    }
}

// Send visit confirmation email
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
        // Calculate progress to NEXT reward milestone
        const nextRewardMilestone = Math.ceil(visitCount / business.visit_goal) * business.visit_goal
        const visitsInCurrentCycle = visitCount % business.visit_goal || business.visit_goal
        const visitsLeft = nextRewardMilestone - visitCount
        const progressPercentage = Math.min((visitsInCurrentCycle / business.visit_goal) * 100, 100)
        const isRewardReached = false // Never show reward in visit confirmation email

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Recorded - ${business.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #10b981 100%);
            color: white;
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 120px;
            height: 120px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            opacity: 0.6;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: -30px;
            left: -30px;
            width: 80px;
            height: 80px;
            background: rgba(16, 185, 129, 0.2);
            border-radius: 50%;
        }
        .linkloyal-brand {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
        .business-name {
            font-size: 48px;
            font-weight: 900;
            margin: 0 0 15px 0;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            letter-spacing: 1.5px;
            line-height: 1.1;
        }
        .visit-status {
            font-size: 22px;
            font-weight: 600;
            margin: 0;
            opacity: 0.95;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .content {
            padding: 40px 30px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .greeting {
            font-size: 20px;
            color: #1e293b;
            margin-bottom: 30px;
            text-align: center;
            font-weight: 600;
        }
        .progress-card {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 35px;
            border-radius: 20px;
            margin: 30px 0;
            border: 3px solid #3b82f6;
            position: relative;
            overflow: hidden;
        }
        .progress-card::before {
            content: '';
            position: absolute;
            top: -10px;
            right: -10px;
            width: 60px;
            height: 60px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 50%;
        }
        .progress-title {
            margin: 0 0 25px 0;
            color: #1e40af;
            text-align: center;
            font-size: 20px;
            font-weight: 700;
        }
        .progress-bar-container {
            background: rgba(255,255,255,0.8);
            border-radius: 25px;
            height: 24px;
            margin: 25px 0;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-bar {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            height: 100%;
            width: ${progressPercentage}%;
            border-radius: 25px;
            transition: width 0.3s ease;
            position: relative;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .progress-percentage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-weight: bold;
            color: #1e293b;
            z-index: 2;
        }
        .visit-stats {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .stat {
            background: rgba(255,255,255,0.9);
            padding: 20px 15px;
            border-radius: 16px;
            border: 2px solid rgba(59, 130, 246, 0.2);
            transition: transform 0.2s ease;
        }
        .stat:hover {
            transform: translateY(-2px);
        }
        .stat-number {
            font-size: 32px;
            font-weight: 900;
            color: #3b82f6;
            margin-bottom: 8px;
            display: block;
            text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }
        .stat-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .reward-preview {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 25px;
            border-radius: 16px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid #f59e0b;
            position: relative;
        }
        .reward-preview::before {
            content: '🎁';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 8px;
            border-radius: 50%;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .reward-title {
            font-size: 18px;
            font-weight: 700;
            color: #92400e;
            margin: 15px 0 5px 0;
        }
        .reward-subtitle {
            font-size: 20px;
            font-weight: 800;
            color: #b45309;
            margin: 10px 0;
        }
        .reward-progress {
            font-size: 16px;
            color: #d97706;
            margin: 10px 0;
        }
        .expiry-notice {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            padding: 15px;
            border-radius: 12px;
            margin-top: 20px;
        }
        .expiry-notice p {
            margin: 0;
            color: #dc2626;
            font-weight: 600;
        }
        .message-card {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            padding: 30px;
            border-radius: 16px;
            border-left: 6px solid #10b981;
            margin: 30px 0;
            font-size: 18px;
            color: #065f46;
            line-height: 1.6;
        }
        .qr-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            margin: 30px 0;
            border: 2px solid #cbd5e1;
        }
        .qr-title {
            color: #1e293b;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .qr-image {
            width: 160px;
            height: 160px;
            border: 4px solid #10b981;
            border-radius: 16px;
            padding: 15px;
            background: white;
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
        }
        .qr-instruction {
            color: #64748b;
            font-size: 14px;
            margin-top: 15px;
            font-weight: 500;
        }
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .footer-business {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 10px;
        }
        .footer-phone {
            font-size: 16px;
            color: #10b981;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer-message {
            font-size: 16px;
            color: #cbd5e1;
            margin: 15px 0;
        }
        .footer-brand {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 20px;
            font-weight: 600;
        }
        
        @media only screen and (max-width: 600px) {
            .container { 
                margin: 10px !important; 
                border-radius: 16px !important;
            }
            .header { 
                padding: 30px 20px !important; 
            }
            .business-name { 
                font-size: 32px !important; 
                margin-bottom: 10px !important;
            }
            .visit-status {
                font-size: 18px !important;
            }
            .content { 
                padding: 30px 20px !important; 
            }
            .progress-card { 
                padding: 25px 20px !important; 
                margin: 20px 0 !important; 
            }
            .visit-stats { 
                grid-template-columns: 1fr !important;
                gap: 15px !important;
                margin: 25px 0 !important;
            }
            .stat { 
                padding: 15px !important;
            }
            .stat-number { 
                font-size: 28px !important; 
            }
            .stat-label { 
                font-size: 11px !important; 
            }
            .greeting {
                font-size: 18px !important;
            }
            .qr-image {
                width: 140px !important;
                height: 140px !important;
            }
            .footer {
                padding: 30px 20px !important;
            }
            .footer-business {
                font-size: 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- Header -->
        <div class="header">
            <div class="linkloyal-brand">
                🔗 LinkLoyal
            </div>
            <h1 class="business-name">${business.name}</h1>
            <p class="visit-status">
                <span>✅</span>
                <span>Visit Recorded!</span>
            </p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello ${customer.name}! 👋
            </div>
            
            ${isRewardReached ? `
            <!-- Reward Reached -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; border-radius: 20px; text-align: center; margin: 30px 0; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
                <h2 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 800;">Congratulations!</h2>
                <p style="margin: 0 0 20px 0; font-size: 20px; opacity: 0.95;">You've earned your reward!</p>
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-top: 25px;">
                    <p style="margin: 0; font-size: 24px; font-weight: bold;">${business.reward_title}</p>
                </div>
                <p style="margin: 20px 0 0 0; font-size: 16px; opacity: 0.9;">Show this email to claim your reward!</p>
            </div>
            ` : `
            <!-- Progress Card -->
            <div class="progress-card">
                <h3 class="progress-title">Your Progress</h3>
                
                <!-- Progress Bar -->
                <div class="progress-bar-container">
                    <div class="progress-bar"></div>
                    <div class="progress-percentage">${Math.round(progressPercentage)}%</div>
                </div>
                
                <!-- Visit Stats -->
                <div class="visit-stats">
                    <div class="stat">
                        <div class="stat-number">${visitCount}</div>
                        <div class="stat-label">VISITS</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${business.visit_goal}</div>
                        <div class="stat-label">GOAL</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${visitsLeft}</div>
                        <div class="stat-label">TO GO</div>
                    </div>
                </div>
            </div>
            
            <!-- Reward Preview -->
            <div class="reward-preview">
                <h3 class="reward-title">Your Reward</h3>
                <p class="reward-subtitle">${business.reward_title}</p>
                <p class="reward-progress">Just ${visitsLeft} more visit${visitsLeft === 1 ? '' : 's'} to go!</p>
                ${rewardExpires ? `
                <div class="expiry-notice">
                    <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">⏰ Note: Rewards expire after ${rewardExpiryMonths} month${rewardExpiryMonths === 1 ? '' : 's'}</p>
                    <p style="margin: 0; font-size: 12px;">Complete your visits to claim before expiry!</p>
                </div>
                ` : ''}
            </div>
            `}
            
            <!-- Message -->
            <div class="message-card">
                <div id="ai-message">
                    ${await generateAIMessage({
            businessName: business.name,
            businessType: business.business_type,
            customerName: customer.name,
            visitCount,
            visitGoal: business.visit_goal,
            rewardTitle: business.reward_title,
            isRewardReached,
            emailType: 'visit_confirmation',
            pendingRewards: isRewardReached ? 1 : 0
        })}
                </div>
                
                ${isRewardReached ? `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin-top: 15px; text-align: center;">
                    <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 Reward Ready to Claim!</h3>
                    <p style="margin: 0; color: #155724; font-weight: bold;">Show this email to our staff to claim your ${business.reward_title}!</p>
                </div>
                ` : ''}
            </div>
            
            <!-- QR Code Reminder -->
            <div class="qr-section">
                <h3 class="qr-title">📱 Your QR Code</h3>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://loyallinkk.vercel.app/mark-visit/${customer.id}`)}" alt="Your QR Code" class="qr-image" />
                <p class="qr-instruction">Show this at your next visit!</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-business">${business.name}</p>
            ${business.phone ? `<p class="footer-phone">📞 ${business.phone}</p>` : ''}
            <p class="footer-message">Thank you for your loyalty!</p>
            <p class="footer-brand">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
        </div>
    </div>
</body>
</html>`

        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

        const response = await fetch(`${baseUrl}/api/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: customer.email,
                message: emailHtml,
                subject: isRewardReached
                    ? `🎉 Reward Earned at ${business.name}!`
                    : `✅ Visit #${visitCount} Recorded - ${business.name}`,
                template: 'raw-html'
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to send visit email: ${errorData.error || 'Unknown error'}`)
        }

        console.log('Visit confirmation email sent successfully to:', customer.email)
    } catch (error) {
        console.error('Error sending visit confirmation email:', error)
        throw error
    }
}

// Send reward completion email
export async function sendRewardCompletionEmail(
    customer: any,
    business: any,
    rewardExpires: boolean = false,
    rewardExpiryMonths: number = 1
): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 Reward Earned!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; font-size: 100px; opacity: 0.1; top: -20px; right: -20px;">🎉</div>
            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px; border: 2px solid rgba(255,255,255,0.2); font-size: 20px; font-weight: 800; letter-spacing: 1px;">
                🔗 LinkLoyal
            </div>
            <h1 style="margin: 0; font-size: 48px; font-weight: 900; letter-spacing: 1.5px;">${business.name}</h1>
            <p style="margin: 15px 0 0 0; font-size: 20px; opacity: 0.95; font-weight: 500;">🎉 CONGRATULATIONS! You've Earned Your Reward!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="font-size: 20px; color: #333; margin-bottom: 20px; text-align: center;">
                Hello ${customer.name}! 🎊
            </div>
            
            <!-- Celebration Banner -->
            <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; border: 3px solid #ff6b6b; position: relative;">
                <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: white; padding: 10px; border-radius: 50%; font-size: 30px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                    🏆
                </div>
                <div style="font-size: 28px; font-weight: bold; color: #d63031; margin: 20px 0 10px 0;">
                    ${business.reward_title}
                </div>
                <div style="font-size: 18px; color: #2d3436; margin: 15px 0; line-height: 1.5;">
                    ${business.reward_description || 'Your loyalty reward is ready!'}
                </div>
            </div>
            
            <!-- Visit Achievement -->
            <div style="background: linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #00b894;">
                <div style="font-size: 48px; font-weight: bold; color: #00b894; margin: 0;">${customer.visits}</div>
                <div style="font-size: 16px; color: #2d3436; margin: 5px 0;">Visits Completed!</div>
                <p style="margin: 10px 0; color: #00b894; font-weight: bold;">
                    🎯 Goal: ${business.visit_goal} visits ✅
                </p>
            </div>
            
            <!-- Claim Section -->
            <div style="background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; color: white;">
                <div style="font-size: 24px; font-weight: bold; margin: 0 0 15px 0;">🎁 How to Claim Your Reward</div>
                <div style="font-size: 16px; margin: 15px 0; line-height: 1.5;">
                    Show this email to any staff member at <strong>${business.name}</strong> to claim your reward!
                    <br><br>
                    ${rewardExpires ? `
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 16px; font-weight: bold;">⏰ IMPORTANT: This reward expires in ${rewardExpiryMonths} month${rewardExpiryMonths === 1 ? '' : 's'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">Please claim it before the expiry date to avoid losing your reward!</p>
                    </div>
                    ` : '<strong>Valid for your next visit</strong>'}
                </div>
                <div style="display: inline-block; background: white; color: #fd79a8; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
                    📱 Save This Email
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #2d3436;">
                    Thank you for being such a loyal customer! 💝
                </p>
                <p style="font-size: 16px; color: #636e72;">
                    Keep visiting to earn more rewards!
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 5px 0; color: #6c757d; font-size: 14px;"><strong>${business.name}</strong></p>
            <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">🏪 We appreciate your loyalty and look forward to seeing you again!</p>
            <p style="font-size: 14px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                This reward email was generated automatically when you completed ${business.visit_goal} visits.
            </p>
        </div>
    </div>
</body>
</html>`

        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

        const response = await fetch(`${baseUrl}/api/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: customer.email,
                message: emailHtml,
                subject: `🎉 Congratulations! You've Earned Your Reward at ${business.name}!`,
                template: 'raw-html'
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to send reward email: ${errorData.error || 'Unknown error'}`)
        }

        console.log('Reward completion email sent successfully to:', customer.email)
    } catch (error) {
        console.error('Error sending reward completion email:', error)
        throw error
    }
}
// Send reward token email
export async function sendRewardTokenEmail(
    customer: any,
    business: any,
    token: string,
    rewardNumber?: number
): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎁 Your Reward is Ready!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; font-size: 120px; opacity: 0.1; top: -30px; right: -30px;">🎁</div>
            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px; border: 2px solid rgba(255,255,255,0.2); font-size: 20px; font-weight: 800; letter-spacing: 1px;">
                🔗 LinkLoyal
            </div>
            <h1 style="margin: 0; font-size: 48px; font-weight: 900; letter-spacing: 1.5px;">${business.name}</h1>
            <p style="margin: 15px 0 0 0; font-size: 20px; opacity: 0.95; font-weight: 500;">🎉 Your ${business.reward_title} is ready!</p>
            ${rewardNumber ? `<p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.8;">Reward #${rewardNumber}</p>` : ''}
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="font-size: 20px; color: #333; margin-bottom: 20px; text-align: center;">
                Hello ${customer.name}! 🎊
            </div>
            
            <!-- Token Display -->}
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 40px; border-radius: 20px; text-align: center; margin: 30px 0; border: 3px solid #fbbf24; position: relative;">
                <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: white; padding: 10px; border-radius: 50%; font-size: 30px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                    🎫
                </div>
                <h2 style="color: #1f2937; margin: 20px 0 10px 0; font-size: 18px;">Your Reward Token</h2>
                <div style="background: white; display: inline-block; padding: 20px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 2px solid #fbbf24; margin: 20px 0;">
                    <div style="font-size: 48px; font-weight: bold; color: #f59e0b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${token}
                    </div>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                    Show this token to claim your reward
                </p>
            </div>
            
            <!-- Reward Details -->}
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid #f59e0b; text-align: center;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px; font-weight: bold;">
                    ${business.reward_title}
                </h3>
                <p style="color: #b45309; margin: 0; font-size: 16px;">
                    Congratulations! You've completed ${customer.visits} visits and earned your ${rewardNumber ? `${rewardNumber}${rewardNumber === 1 ? 'st' : rewardNumber === 2 ? 'nd' : rewardNumber === 3 ? 'rd' : 'th'} ` : ''}reward!
                </p>
            </div>
            
            <!-- Instructions */}
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 30px; border-radius: 16px; margin: 30px 0; border: 2px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                    📋 How to Claim Your Reward:
                </h3>
                <ol style="color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li><strong>Visit ${business.name}</strong></li>
                    <li><strong>Show this email</strong> or tell them your token: <strong>${token}</strong></li>
                    <li><strong>Staff will enter the token</strong> in their system</li>
                    <li><strong>Enjoy your ${business.reward_title}!</strong> 🎉</li>
                </ol>
            </div>
            
            <!-- Important Notes */}
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">⚠️ Important:</h4>
                <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                    <li>This token can only be used once</li>
                    <li>Valid only at ${business.name}</li>
                    <li>Keep this email safe until you claim your reward</li>
                    <li>After claiming, you'll start earning towards your next reward!</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #2d3436; font-weight: bold;">
                    🎉 Congratulations on your loyalty! 🎉
                </p>
                <p style="font-size: 16px; color: #636e72;">
                    Thank you for being such a valued customer!
                </p>
            </div>
        </div>
        
        <!-- Footer -->}
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <div style="background: rgba(79, 70, 229, 0.1); backdrop-filter: blur(10px); display: inline-block; padding: 20px 30px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(79, 70, 229, 0.2);">
                <p style="margin: 0 0 10px 0; color: #4f46e5; font-size: 18px; font-weight: 700;">
                    ${business.name}
                </p>
                ${business.phone ?
                `<p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        📞 ${business.phone}
                    </p>` : ''
            }
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    We appreciate your loyalty!
                </p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LoyalLink</strong> - Making loyalty simple and rewarding
            </p>
        </div>
    </div>
</body>
</html>`

        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

        const response = await fetch(`${baseUrl}/api/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: customer.email,
                message: emailHtml,
                subject: `🎁 Your Reward Token: ${token} - ${business.name}`,
                template: 'raw-html'
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to send reward token email: ${errorData.error || 'Unknown error'}`)
        }

        console.log('Reward token email sent successfully to:', customer.email)
    } catch (error) {
        console.error('Error sending reward token email:', error)
        throw error
    }
}