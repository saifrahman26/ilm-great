// Unified email service that works with Resend
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    fromName: string = 'LinkLoyal'
): Promise<boolean> {
    try {
        console.log('📧 Attempting to send email...')
        console.log('📧 To:', to)
        console.log('📧 Subject:', subject)
        console.log('📧 API Key present:', !!process.env.RESEND_API_KEY)
        console.log('📧 API Key length:', process.env.RESEND_API_KEY?.length)

        // Use Resend's onboarding domain for testing
        const fromEmail = process.env.VERIFIED_EMAIL || 'onboarding@resend.dev'
        console.log('📧 From email:', fromEmail)

        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: [to],
            subject: subject,
            html: htmlContent,
        })

        if (error) {
            console.error('❌ Resend email error:', error)
            console.error('❌ Error details:', JSON.stringify(error, null, 2))
            return false
        }

        console.log('✅ Email sent successfully:', data?.id)
        console.log('✅ Email data:', JSON.stringify(data, null, 2))
        return true
    } catch (error) {
        console.error('❌ Email sending failed with exception:', error)
        console.error('❌ Exception details:', JSON.stringify(error, null, 2))
        return false
    }
}

// AI-enhanced email sending function
export async function sendAIEnhancedEmail(
    to: string,
    customerName: string,
    businessName: string,
    businessType: string,
    emailType: 'visit_confirmation' | 'reward_earned' | 'inactive_reminder',
    context: {
        visitCount?: number
        visitGoal?: number
        rewardTitle?: string
        isRewardReached?: boolean
        daysSinceLastVisit?: number
        specialOffer?: string
    }
): Promise<boolean> {
    try {
        // Import AI service dynamically to avoid circular dependencies
        const { aiService } = await import('./ai')

        // Generate AI-powered email content
        const aiResponse = await aiService.generatePersonalizedEmail({
            businessName,
            businessType,
            customerName,
            visitCount: context.visitCount || 0,
            visitGoal: context.visitGoal || 5,
            rewardTitle: context.rewardTitle || 'Loyalty Reward',
            isRewardReached: context.isRewardReached || false,
            emailType,
            daysSinceLastVisit: context.daysSinceLastVisit,
            specialOffer: context.specialOffer
        })

        let emailContent = ''
        let subject = ''

        if (aiResponse.success && aiResponse.content) {
            emailContent = aiResponse.content
            console.log('✅ Using AI-generated email content')
        } else {
            // Fallback content
            console.warn('⚠️ AI failed, using fallback content:', aiResponse.error)
            emailContent = generateFallbackContent(customerName, businessName, emailType, context)
        }

        // Generate subject based on email type
        switch (emailType) {
            case 'visit_confirmation':
                subject = context.isRewardReached
                    ? `🎉 Reward Earned at ${businessName}!`
                    : `Thank you for visiting ${businessName}!`
                break
            case 'reward_earned':
                subject = `🎁 Your ${context.rewardTitle} is ready at ${businessName}!`
                break
            case 'inactive_reminder':
                subject = `We miss you at ${businessName}! ${context.specialOffer ? '+ Special offer' : ''}`
                break
        }

        // Create HTML email template
        const htmlContent = createEmailTemplate(businessName, customerName, emailContent, emailType, context)

        // Send the email
        return await sendEmail(to, subject, htmlContent, businessName)

    } catch (error) {
        console.error('❌ AI-enhanced email failed:', error)
        return false
    }
}

// Fallback content generator
function generateFallbackContent(
    customerName: string,
    businessName: string,
    emailType: string,
    context: any
): string {
    switch (emailType) {
        case 'visit_confirmation':
            if (context.isRewardReached) {
                return `🎉 Amazing, ${customerName}! You've completed ${context.visitCount} visits and earned your ${context.rewardTitle}! Thank you for being such a loyal customer at ${businessName}. 🎁`
            } else {
                const remaining = (context.visitGoal || 5) - (context.visitCount || 0)
                return `Thank you for visiting ${businessName}, ${customerName}! 🙏 You now have ${context.visitCount} of ${context.visitGoal} visits. Just ${remaining} more visit${remaining === 1 ? '' : 's'} to earn your ${context.rewardTitle}! 🎯`
            }
        case 'reward_earned':
            return `🎉 Congratulations ${customerName}! You've earned your ${context.rewardTitle} at ${businessName}! Show this email to our staff to claim your well-deserved reward. Thank you for your loyalty! 🎁`
        case 'inactive_reminder':
            return `We miss you at ${businessName}, ${customerName}! 💙 It's been ${context.daysSinceLastVisit || 30} days since your last visit. Come back soon and continue your journey to earn your ${context.rewardTitle}! ${context.specialOffer ? `Plus, enjoy ${context.specialOffer}!` : ''} We can't wait to see you again. ✨`
        default:
            return `Hello ${customerName}! Thank you for being a valued customer at ${businessName}. We appreciate your loyalty! 🙏`
    }
}

// Premium reward email sending function
export async function sendPremiumRewardEmail(
    to: string,
    customerName: string,
    businessName: string,
    businessType: string,
    context: {
        rewardTitle: string
        claimToken: string
        qrCodeUrl: string
        businessId: string
    }
): Promise<boolean> {
    try {
        // Import AI service dynamically
        const { aiService } = await import('./ai')

        // Generate AI-powered congratulatory message
        const aiResponse = await aiService.generatePersonalizedEmail({
            businessName,
            businessType,
            customerName,
            visitCount: 0, // Not relevant for reward email
            visitGoal: 0, // Not relevant for reward email
            rewardTitle: context.rewardTitle,
            isRewardReached: true,
            emailType: 'reward_earned'
        })

        let aiMessage = ''
        if (aiResponse.success && aiResponse.content) {
            aiMessage = aiResponse.content
            console.log('✅ Using AI-generated reward message')
        } else {
            // Fallback AI message
            aiMessage = `🎉 Incredible news, ${customerName}! You've achieved something truly special at ${businessName}. Your dedication and loyalty have earned you this exclusive reward. This moment marks your success in our loyalty journey - congratulations on reaching this milestone! 🌟`
            console.warn('⚠️ AI failed, using premium fallback message')
        }

        // Create premium HTML email template
        const htmlContent = createPremiumRewardTemplate(
            businessName,
            customerName,
            aiMessage,
            context
        )

        const subject = `🎁 EXCLUSIVE REWARD EARNED - ${context.rewardTitle} at ${businessName}!`

        // Send the email
        return await sendEmail(to, subject, htmlContent, businessName)

    } catch (error) {
        console.error('❌ Premium reward email failed:', error)
        return false
    }
}

// Email HTML template
function createEmailTemplate(
    businessName: string,
    customerName: string,
    content: string,
    emailType: string,
    context: any
): string {
    const gradientColor = emailType === 'reward_earned'
        ? 'from-green-600 to-emerald-600'
        : emailType === 'inactive_reminder'
            ? 'from-orange-600 to-red-600'
            : 'from-blue-600 to-purple-600'

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Loyalty Program</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🔗 ${businessName}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Loyalty Program</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Hello ${customerName}! 👋</h2>
        
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            ${content}
        </div>
        
        ${context.isRewardReached ? `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
            <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 Reward Ready to Claim!</h3>
            <p style="margin: 0; color: #155724; font-weight: bold;">Show this email to our staff to claim your ${context.rewardTitle}!</p>
        </div>
        ` : ''}
        
        ${context.visitCount !== undefined ? `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; color: #495057; font-size: 14px;">
                <strong>Visit Progress:</strong> ${context.visitCount} of ${context.visitGoal} visits completed
            </p>
        </div>
        ` : ''}
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>Powered by 🔗 LinkLoyal - Making loyalty simple and rewarding</p>
    </div>
</body>
</html>`
}

// Premium reward email HTML template
function createPremiumRewardTemplate(
    businessName: string,
    customerName: string,
    aiMessage: string,
    context: {
        rewardTitle: string
        claimToken: string
        qrCodeUrl: string
        businessId: string
    }
): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎁 EXCLUSIVE REWARD - ${businessName}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
    
    <!-- Premium Header with Gradient -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 0;">
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; backdrop-filter: blur(10px);">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                🎁 EXCLUSIVE REWARD EARNED
            </h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95; font-weight: 500;">
                ${businessName} • Premium Loyalty Program
            </p>
        </div>
    </div>
    
    <!-- AI-Generated Premium Message -->
    <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; margin: 0; border-left: 5px solid #ff6b6b;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background: #ff6b6b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px;">
                🤖
            </div>
            <h3 style="margin: 0; color: #d63031; font-size: 18px; font-weight: bold;">
                AI-Powered Personal Message
            </h3>
        </div>
        <div style="font-size: 16px; line-height: 1.7; color: #2d3436; font-style: italic; background: rgba(255,255,255,0.7); padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b6b;">
            ${aiMessage}
        </div>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px 30px; margin: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3436; margin-top: 0; font-size: 24px; text-align: center;">
            Hello ${customerName}! 👋
        </h2>
        
        <!-- Reward Details Card -->
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0; border: 2px solid #00b894;">
            <h3 style="margin: 0 0 15px 0; color: #00b894; font-size: 22px;">
                🏆 YOUR EXCLUSIVE REWARD
            </h3>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2d3436;">
                    ${context.rewardTitle}
                </p>
            </div>
        </div>
        
        <!-- Claim Instructions -->
        <div style="background: #f1f2f6; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #6c5ce7;">
            <h4 style="margin: 0 0 15px 0; color: #6c5ce7; font-size: 18px;">
                🎯 HOW TO CLAIM YOUR REWARD
            </h4>
            <ol style="margin: 0; padding-left: 20px; color: #2d3436;">
                <li style="margin-bottom: 10px; font-size: 16px;">Show this email to our staff</li>
                <li style="margin-bottom: 10px; font-size: 16px;">Present your unique claim code: <strong style="background: #6c5ce7; color: white; padding: 5px 10px; border-radius: 5px; font-family: monospace;">${context.claimToken}</strong></li>
                <li style="margin-bottom: 10px; font-size: 16px;">Or scan the QR code below</li>
                <li style="margin-bottom: 0; font-size: 16px;">Enjoy your well-deserved reward! 🎉</li>
            </ol>
        </div>
        
        <!-- QR Code Section -->
        <div style="text-align: center; margin: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px;">
            <h4 style="color: white; margin: 0 0 20px 0; font-size: 18px;">
                📱 SCAN TO CLAIM INSTANTLY
            </h4>
            <div style="background: white; padding: 20px; border-radius: 15px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <img src="${context.qrCodeUrl}" alt="Reward Claim QR Code" style="max-width: 180px; height: auto; border-radius: 10px;" />
            </div>
            <p style="color: white; margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
                Show this QR code to staff for instant reward redemption
            </p>
        </div>
        
        <!-- Unique Claim Code Highlight -->
        <div style="background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; text-align: center; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: white; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                🔐 YOUR UNIQUE CLAIM CODE
            </h4>
            <div style="background: white; padding: 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #2d3436; letter-spacing: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                ${context.claimToken}
            </div>
            <p style="margin: 10px 0 0 0; color: white; font-size: 12px; opacity: 0.9;">
                Keep this code safe - it's your key to claiming your reward!
            </p>
        </div>
        
        <!-- Important Notice -->
        <div style="background: #ffe8e8; border: 2px solid #ff6b6b; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 24px; margin-right: 10px;">⚠️</span>
                <h4 style="margin: 0; color: #d63031; font-size: 16px;">IMPORTANT - SAVE THIS EMAIL</h4>
            </div>
            <p style="margin: 0; color: #2d3436; font-size: 14px; line-height: 1.5;">
                This email contains your unique reward claim code and QR code. Please save it or take a screenshot. 
                Your reward is valid and ready to be claimed at your next visit to ${businessName}.
            </p>
        </div>
    </div>
    
    <!-- Premium Footer -->
    <div style="background: #2d3436; color: white; text-align: center; padding: 30px; margin: 0;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">🌟 Thank You for Your Loyalty!</h3>
        <p style="margin: 0 0 15px 0; opacity: 0.8; font-size: 14px;">
            You're part of an exclusive community at ${businessName}
        </p>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
                Powered by 🔗 LinkLoyal - Premium Loyalty Experience
            </p>
        </div>
    </div>
</body>
</html>`
}