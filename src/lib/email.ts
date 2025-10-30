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
        customerId?: string
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

        // Generate QR code for customer (for visit confirmation emails)
        let qrCodeUrl = ''
        if (emailType === 'visit_confirmation' && context.customerId) {
            try {
                const { generateQRCode } = await import('./messaging')
                qrCodeUrl = await generateQRCode(`https://loyallinkk.vercel.app/mark-visit/${context.customerId}`)
            } catch (error) {
                console.warn('Failed to generate QR code for email:', error)
            }
        }

        // Create HTML email template
        const htmlContent = createEmailTemplate(businessName, customerName, emailContent, emailType, { ...context, qrCodeUrl })

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
    // Fix visit count logic to be consistent - use modulo for current cycle
    const totalVisits = context.visitCount || 0
    const visitGoal = context.visitGoal || 5

    // Calculate current cycle visits (resets after each reward)
    const currentCycleVisits = totalVisits % visitGoal
    const currentVisits = currentCycleVisits === 0 && totalVisits > 0 ? visitGoal : currentCycleVisits
    const visitsRemaining = Math.max(0, visitGoal - currentVisits)

    switch (emailType) {
        case 'visit_confirmation':
            if (context.isRewardReached) {
                return `🎉 Amazing, ${customerName}! You've completed ${currentVisits} visits and earned your ${context.rewardTitle}! Thank you for being such a loyal customer at ${businessName}. 🎁`
            } else {
                return `Thank you for visiting ${businessName}, ${customerName}! 🙏 You now have ${currentVisits} of ${visitGoal} visits. Just ${visitsRemaining} more visit${visitsRemaining === 1 ? '' : 's'} to earn your ${context.rewardTitle}! 🎯`
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
    // Fix visit count logic - use modulo to show current cycle progress
    const totalVisits = context.visitCount || 0
    const visitGoal = context.visitGoal || 5

    // Calculate current cycle visits (resets after each reward)
    const currentCycleVisits = totalVisits % visitGoal
    const currentVisits = currentCycleVisits === 0 && totalVisits > 0 ? visitGoal : currentCycleVisits
    const visitsRemaining = Math.max(0, visitGoal - currentVisits)

    // Calculate progress percentage based on current cycle
    const progressPercentage = visitGoal > 0
        ? (currentVisits / visitGoal) * 100
        : 0

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Loyalty Program</title>
    <style>
        /* Mobile-first responsive styles */
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            .header {
                padding: 20px 15px !important;
                border-radius: 0 !important;
            }
            .header h1 {
                font-size: 24px !important;
                line-height: 1.2 !important;
            }
            .content {
                padding: 20px 15px !important;
                border-radius: 0 !important;
            }
            .progress-section {
                padding: 15px !important;
                margin: 20px 0 !important;
            }
            .progress-numbers {
                font-size: 20px !important;
            }
            .qr-container {
                max-width: 100% !important;
                padding: 20px 15px !important;
            }
            .qr-code-img {
                width: 180px !important;
                height: 180px !important;
            }
            .qr-download-btn {
                display: block !important;
                width: 90% !important;
                max-width: 280px !important;
                margin: 15px auto !important;
                padding: 15px 20px !important;
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div class="header" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔗 ${businessName}</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Loyalty Program</p>
        </div>
        
        <div class="content" style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #4f46e5; margin-top: 0; font-size: 22px;">Hello ${customerName}! 👋</h2>
            
            <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                ${content}
            </div>
            
            ${context.isRewardReached ? `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #155724; margin: 0 0 10px 0; font-size: 18px;">🎉 Reward Ready to Claim!</h3>
                <p style="margin: 0; color: #155724; font-weight: bold; font-size: 16px;">Show this email to our staff to claim your ${context.rewardTitle}!</p>
            </div>
            ` : ''}
            
            ${currentVisits > 0 && visitGoal > 0 ? `
            <!-- Progress Bar Section -->
            <div class="progress-section" style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e9ecef;">
                <h3 style="margin: 0 0 20px 0; color: #495057; text-align: center; font-size: 18px;">
                    🎯 Your Loyalty Progress
                </h3>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <span class="progress-numbers" style="font-size: 28px; font-weight: bold; color: #4f46e5;">
                        ${currentVisits} / ${visitGoal}
                    </span>
                    <span style="font-size: 16px; color: #6c757d; margin-left: 8px;">visits</span>
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #e9ecef; border-radius: 25px; height: 24px; margin: 20px 0; overflow: hidden; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%); height: 100%; width: ${progressPercentage}%; border-radius: 25px; transition: width 0.3s ease; min-width: ${progressPercentage > 0 ? '24px' : '0'};"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${progressPercentage > 50 ? 'white' : '#495057'}; font-size: 13px; font-weight: bold; text-shadow: ${progressPercentage > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'};">
                        ${Math.round(progressPercentage)}%
                    </div>
                </div>
                
                ${!context.isRewardReached ? `
                <p style="margin: 15px 0 0 0; color: #6c757d; text-align: center; font-size: 15px; line-height: 1.4;">
                    ${visitsRemaining} more visit${visitsRemaining === 1 ? '' : 's'} to earn your <strong style="color: #4f46e5;">${context.rewardTitle}</strong>!
                </p>
                ` : `
                <p style="margin: 15px 0 0 0; color: #28a745; text-align: center; font-size: 15px; font-weight: bold;">
                    🎉 Congratulations! You've earned your <strong>${context.rewardTitle}</strong>!
                </p>
                `}
            </div>
            ` : ''}
            
            ${context.qrCodeUrl && emailType === 'visit_confirmation' ? `
            <!-- Mobile-Optimized QR Code Section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
                <h3 style="color: white; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                    📱 Your Personal QR Code
                </h3>
                
                <!-- Mobile-optimized QR container -->
                <div class="qr-container" style="background: white; padding: 25px 20px; border-radius: 15px; margin: 15px auto; max-width: 320px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #333; font-size: 20px; font-weight: bold; line-height: 1.2;">
                            ${businessName}
                        </h2>
                        <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Loyalty Program</p>
                    </div>
                    
                    <!-- Larger, mobile-friendly QR code -->
                    <div style="text-align: center; margin: 20px 0; padding: 10px; background: #f8f9fa; border-radius: 12px;">
                        <img class="qr-code-img" src="${context.qrCodeUrl}" alt="Your QR Code" style="width: 200px; height: 200px; max-width: 100%; border: 4px solid #4f46e5; border-radius: 12px; display: block; margin: 0 auto; background: white; padding: 8px;" />
                    </div>
                    
                    <p style="margin: 15px 0 0 0; color: #666; font-size: 14px; font-weight: 600;">
                        Customer: ${customerName}
                    </p>
                </div>
                
                <!-- Mobile-friendly instructions -->
                <div style="margin-top: 20px; padding: 0 10px;">
                    <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                        📥 Save this QR code to your phone!
                    </p>
                    <p style="color: white; margin: 0 0 20px 0; font-size: 14px; opacity: 0.9; line-height: 1.5;">
                        Show this code to staff to record your visit instantly
                    </p>
                    <a href="/api/qr-download/${context.customerId}" 
                       class="qr-download-btn"
                       style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 14px 24px; border-radius: 25px; text-decoration: none; font-size: 14px; font-weight: bold; border: 2px solid rgba(255,255,255,0.3); margin-top: 5px; transition: all 0.3s ease; backdrop-filter: blur(5px);">
                        📱 Download High-Quality QR Code
                    </a>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa;">
            <p style="margin: 0;">Powered by 🔗 LinkLoyal - Making loyalty simple and rewarding</p>
        </div>
    </div>
</body>
</html>`
}

// Clean and elegant reward email template
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
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>🎁 Reward Earned - ${businessName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '🎉';
            position: absolute;
            font-size: 100px;
            opacity: 0.1;
            top: -20px;
            right: -20px;
        }
        .business-name {
            font-size: 48px;
            font-weight: 900;
            margin: 0 0 15px 0;
            text-shadow: 0 3px 6px rgba(0,0,0,0.4);
            letter-spacing: 1.2px;
            line-height: 1.1;
        }
        .header .subtitle {
            margin: 15px 0 20px 0;
            font-size: 20px;
            opacity: 0.95;
            font-weight: 500;
        }
        .linkloyal-brand {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(5px);
            display: inline-block;
            padding: 4px 10px;
            border-radius: 15px;
            margin-top: 15px;
            border: 1px solid rgba(255,255,255,0.15);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.3px;
            opacity: 0.7;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .ai-message {
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe082 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #f39c12;
            margin: 25px 0;
            font-size: 16px;
            color: #e65100;
            font-style: italic;
            line-height: 1.6;
        }
        .reward-card {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 50%, #fdcb6e 100%);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid #f39c12;
            position: relative;
        }
        .reward-card::before {
            content: '🏆';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 10px;
            border-radius: 50%;
            font-size: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .reward-title {
            font-size: 28px;
            font-weight: bold;
            color: #d35400;
            margin: 20px 0 10px 0;
        }
        .claim-section {
            background: linear-gradient(135deg, #ff8f00 0%, #ff6f00 50%, #e65100 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            color: white;
        }
        .claim-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 15px 0;
        }
        .claim-token {
            background: white;
            color: #e65100;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 20px 0;
            border: 2px dashed #ff8f00;
            display: inline-block;
        }
        .qr-section {
            text-align: center;
            margin: 25px 0;
        }
        .qr-code {
            background: white;
            padding: 15px;
            border-radius: 12px;
            display: inline-block;
            border: 2px solid #f39c12;
            box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
        }
        .instructions {
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
            border: 2px solid #f39c12;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .instructions h4 {
            margin: 0 0 15px 0;
            color: #e65100;
            font-size: 18px;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
            color: #e65100;
        }
        .instructions li {
            margin: 8px 0;
            font-weight: 500;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .business-contact {
            font-size: 20px;
            font-weight: 800;
            color: #333;
            margin-bottom: 10px;
        }
        /* Mobile-First Responsive Design */
        @media (max-width: 600px) {
            .container {
                margin: 0 !important;
                box-shadow: none !important;
                width: 100% !important;
                border-radius: 0 !important;
            }
            .header, .content, .footer {
                padding: 20px 16px !important;
            }
            .header {
                padding: 30px 16px !important;
            }
            .business-name {
                font-size: 28px !important;
                margin-bottom: 12px !important;
                line-height: 1.2 !important;
            }
            .header .subtitle {
                font-size: 16px !important;
                margin: 12px 0 16px 0 !important;
                line-height: 1.3 !important;
            }
            .linkloyal-brand {
                font-size: 10px !important;
                padding: 4px 10px !important;
                margin-top: 12px !important;
            }
            .reward-title {
                font-size: 24px !important;
                line-height: 1.2 !important;
                margin: 16px 0 12px 0 !important;
            }
            .reward-card {
                padding: 24px 16px !important;
                margin: 24px 0 !important;
                border-radius: 16px !important;
            }
            .reward-card::before {
                font-size: 24px !important;
                padding: 8px !important;
                top: -12px !important;
            }
            .claim-section {
                padding: 24px 16px !important;
                margin: 24px 0 !important;
                border-radius: 16px !important;
            }
            .claim-title {
                font-size: 22px !important;
                line-height: 1.2 !important;
                margin: 0 0 16px 0 !important;
            }
            .claim-token {
                font-size: 20px !important;
                padding: 12px 16px !important;
                letter-spacing: 1px !important;
            }
            .ai-message {
                padding: 20px !important;
                font-size: 15px !important;
                line-height: 1.5 !important;
                border-radius: 12px !important;
            }
            .instructions {
                padding: 20px !important;
                margin: 20px 0 !important;
                border-radius: 12px !important;
            }
            .instructions h4 {
                font-size: 16px !important;
            }
            .qr-code img {
                max-width: 120px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="business-name">${businessName}</h1>
            <p class="subtitle">🎉 CONGRATULATIONS! You've Earned Your Reward!</p>
            <div class="linkloyal-brand">
                🔗 LinkLoyal
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear ${customerName}, 🎊
            </div>
            
            <div class="ai-message">
                ${aiMessage}
            </div>
            
            <div class="reward-card">
                <div class="reward-title">${context.rewardTitle}</div>
                <p style="margin: 15px 0; color: #e65100; font-size: 16px;">
                    Your loyalty has been rewarded! 🌟
                </p>
            </div>
            
            <div class="claim-section">
                <div class="claim-title">🎁 How to Claim Your Reward</div>
                <p style="margin: 15px 0; font-size: 16px;">
                    Show this claim code to any team member:
                </p>
                <div class="claim-token">${context.claimToken}</div>
            </div>
            
            <div class="qr-section">
                <h4 style="margin: 0 0 15px 0; color: #e65100;">📱 Or Scan This QR Code</h4>
                <div class="qr-code">
                    <img src="${context.qrCodeUrl}" alt="Reward QR Code" style="max-width: 150px; height: auto;" />
                </div>
            </div>
            
            <div class="instructions">
                <h4>✨ Redemption Instructions:</h4>
                <ol>
                    <li>Visit ${businessName} at your convenience</li>
                    <li>Show this email to any staff member</li>
                    <li>Present your claim code or scan the QR code</li>
                    <li>Enjoy your well-deserved reward! 🎉</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #e65100; font-weight: 600;">
                    Thank you for being such a loyal customer! 💝
                </p>
                <p style="font-size: 16px; color: #636e72;">
                    Keep visiting to earn more amazing rewards!
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p class="business-contact">${businessName}</p>
            <p>🏪 We appreciate your loyalty and look forward to seeing you again!</p>
            <p style="font-size: 12px; color: #666; margin-top: 15px; font-weight: 600;">
                Powered by <strong>🔗 LinkLoyal</strong> - Making loyalty simple and rewarding
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                You've successfully earned this exclusive reward through your continued loyalty!
            </p>
        </div>
    </div>
</body>
</html>`
}