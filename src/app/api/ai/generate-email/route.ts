import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const {
            businessName,
            businessType,
            customerName,
            visitCount,
            visitGoal,
            rewardTitle,
            isRewardReached,
            emailType,
            customerHistory
        } = await request.json()

        // Validate required fields
        if (!businessName || !customerName || !emailType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: businessName, customerName, emailType'
                },
                { status: 400 }
            )
        }

        // Validate email type
        const validEmailTypes = ['visit_confirmation', 'reward_earned', 'inactive_reminder']
        if (!validEmailTypes.includes(emailType)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid email type. Must be one of: ${validEmailTypes.join(', ')}`
                },
                { status: 400 }
            )
        }

        // Generate AI-powered email content
        const aiResponse = await aiService.generatePersonalizedEmail({
            businessName,
            businessType,
            customerName,
            visitCount: visitCount || 0,
            visitGoal: visitGoal || 5,
            rewardTitle: rewardTitle || 'Loyalty Reward',
            isRewardReached: isRewardReached || false,
            customerHistory,
            emailType
        })

        if (!aiResponse.success) {
            // Provide fallback content if AI fails
            const fallbackContent = generateFallbackContent({
                businessName,
                customerName,
                visitCount: visitCount || 0,
                visitGoal: visitGoal || 5,
                rewardTitle: rewardTitle || 'Loyalty Reward',
                isRewardReached: isRewardReached || false,
                emailType
            })

            return NextResponse.json({
                success: true,
                content: fallbackContent,
                isAIGenerated: false,
                error: aiResponse.error
            })
        }

        return NextResponse.json({
            success: true,
            content: aiResponse.content,
            isAIGenerated: true
        })

    } catch (error) {
        console.error('Email generation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Fallback content generator when AI is unavailable
function generateFallbackContent({
    businessName,
    customerName,
    visitCount,
    visitGoal,
    rewardTitle,
    isRewardReached,
    emailType
}: {
    businessName: string
    customerName: string
    visitCount: number
    visitGoal: number
    rewardTitle: string
    isRewardReached: boolean
    emailType: string
}): string {
    switch (emailType) {
        case 'visit_confirmation':
            if (isRewardReached) {
                return `🎉 Amazing, ${customerName}! You've completed ${visitCount} visits and earned your ${rewardTitle}! Thank you for being such a loyal customer at ${businessName}. 🎁`
            } else {
                const remaining = visitGoal - visitCount
                return `Thank you for visiting ${businessName}, ${customerName}! 🙏 You now have ${visitCount} of ${visitGoal} visits. Just ${remaining} more visit${remaining === 1 ? '' : 's'} to earn your ${rewardTitle}! 🎯`
            }

        case 'reward_earned':
            return `🎉 Congratulations ${customerName}! You've earned your ${rewardTitle} at ${businessName}! Show this email to our staff to claim your well-deserved reward. Thank you for your loyalty! 🎁`

        case 'inactive_reminder':
            return `We miss you at ${businessName}, ${customerName}! 💙 It's been a while since your last visit. Come back soon and continue your journey to earn your ${rewardTitle}! We can't wait to see you again. ✨`

        default:
            return `Hello ${customerName}! Thank you for being a valued customer at ${businessName}. We appreciate your loyalty! 🙏`
    }
}