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