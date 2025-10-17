import { Customer } from './supabase'

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
                    name: 'LoyalLink',
                    email: process.env.BREVO_SENDER_EMAIL || 'noreply@loyallink.com'
                },
                to: [
                    {
                        email: customer.email,
                        name: customer.name
                    }
                ],
                subject: `[LoyalLink] ${subject}`,
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
        const businessName = businessInfo?.name || 'LoyalLink Business'
        const rewardTitle = businessInfo?.rewardTitle || 'Loyalty Reward'
        const visitGoal = businessInfo?.visitGoal || 5

        // Create a beautiful LoyalLink-branded email with QR code
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${businessName} - Your LoyalLink QR Code</title>
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
            .loyallink-logo { font-size: 22px !important; padding: 12px 20px !important; }
        }
    </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Enhanced Header with LoyalLink Branding -->
        <div class="header" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); padding: 40px; border-radius: 24px 24px 0 0; text-align: center; position: relative; overflow: hidden;">
            <!-- Background Pattern -->
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
            
            <!-- LoyalLink Logo -->
            <div class="loyallink-logo" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: inline-block; padding: 20px 30px; border-radius: 60px; margin-bottom: 25px; border: 2px solid rgba(255,255,255,0.2);">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    🔗 LoyalLink
                </h1>
            </div>
            
            <h2 class="main-title" style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); line-height: 1.1;">
                Welcome to ${businessName}!
            </h2>
            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 500; line-height: 1.3;">
                🎉 Your loyalty journey starts here
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
                    Powered by <strong>🔗 LoyalLink</strong>
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
                subject: `🔗 Welcome to ${businessName} - Your LoyalLink QR Code Inside!`,
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
    visitCount: number
): Promise<void> {
    if (!customer.email) {
        console.log('No email provided for customer:', customer.name)
        return
    }

    try {
        const visitsLeft = business.visit_goal - visitCount
        const progressPercentage = Math.min((visitCount / business.visit_goal) * 100, 100)
        const isRewardReached = visitCount >= business.visit_goal

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Recorded - ${business.name}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px; border: 2px solid rgba(255,255,255,0.2); font-size: 20px; font-weight: 800; letter-spacing: 1px;">
                🔗 LoyalLink
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">✅ Visit Recorded!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">${business.name}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
                Hello ${customer.name}! 👋
            </div>
            
            ${isRewardReached ? `
            <!-- Reward Reached -->
            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);">
                <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">Congratulations!</h2>
                <p style="margin: 0; font-size: 18px; opacity: 0.95;">You've earned your reward!</p>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0; font-size: 20px; font-weight: bold;">${business.reward_title}</p>
                </div>
                <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">Show this email to claim your reward!</p>
            </div>
            ` : `
            <!-- Progress Card -->
            <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 2px solid #0ea5e9;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e; text-align: center;">Your Progress</h3>
                
                <!-- Progress Bar -->
                <div style="background-color: #e0e0e0; border-radius: 25px; height: 20px; margin: 20px 0; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${progressPercentage}%; border-radius: 25px; transition: width 0.3s ease;"></div>
                </div>
                
                <!-- Visit Stats -->
                <div style="display: flex; justify-content: space-around; margin: 20px 0; text-align: center;">
                    <div>
                        <div style="font-size: 32px; font-weight: bold; color: #0ea5e9;">${visitCount}</div>
                        <div style="font-size: 14px; color: #64748b;">Visits</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: bold; color: #0ea5e9;">${business.visit_goal}</div>
                        <div style="font-size: 14px; color: #64748b;">Goal</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: bold; color: #0ea5e9;">${visitsLeft}</div>
                        <div style="font-size: 14px; color: #64748b;">To Go</div>
                    </div>
                </div>
            </div>
            
            <!-- Reward Preview -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b;">
                <h3 style="margin: 0; color: #92400e;">🎁 Your Reward</h3>
                <p style="margin: 10px 0; color: #b45309; font-size: 18px; font-weight: bold;">${business.reward_title}</p>
                <p style="margin: 10px 0; color: #d97706;">Just ${visitsLeft} more visit${visitsLeft === 1 ? '' : 's'} to go!</p>
            </div>
            `}
            
            <!-- Message -->
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0; font-size: 16px; color: #555;">
                ${isRewardReached
                ? `🎉 Amazing! You've completed ${visitCount} visits and earned your <strong>${business.reward_title}</strong>! Show this email at your next visit to claim it.`
                : `Thank you for your visit! You now have <strong>${visitCount} of ${business.visit_goal}</strong> visits. Keep going to earn your <strong>${business.reward_title}</strong>!`
            }
            </div>
            
            <!-- QR Code Reminder -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px;">
                <h3 style="color: #333; margin-bottom: 15px;">📱 Your QR Code</h3>
                <img src="${customer.qr_code_url}" alt="Your QR Code" style="width: 150px; height: 150px; border: 3px solid #10b981; border-radius: 12px; padding: 10px; background: white;" />
                <p style="color: #666; font-size: 14px; margin-top: 15px;">Show this at your next visit!</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 5px 0; color: #6c757d; font-size: 14px;"><strong>${business.name}</strong></p>
            <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Thank you for your loyalty!</p>
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
    business: any
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
                🔗 LoyalLink
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 CONGRATULATIONS!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You've Earned Your Reward!</p>
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
                    <strong>Valid for your next visit</strong>
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
                Powered by <strong>🔗 LoyalLink</strong> - Making loyalty simple and rewarding
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
