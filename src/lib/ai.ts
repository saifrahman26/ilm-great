import { getOpenRouterApiKey, getSiteConfig } from './env'

// AI Service using OpenRouter API
interface AIMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface AIResponse {
    success: boolean
    content?: string
    error?: string
}

class AIService {
    private apiKey: string
    private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions'
    private model: string = 'minimax/minimax-m2:free'

    constructor() {
        // Use the env helper function to get the API key
        this.apiKey = getOpenRouterApiKey()
        console.log('🔑 AI Service initialized with API key length:', this.apiKey.length)

        if (!this.apiKey) {
            console.error('❌ No API key available')
        }
    }

    async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
        if (!this.apiKey) {
            console.error('❌ OpenRouter API key not available')
            return {
                success: false,
                error: 'OpenRouter API key not configured'
            }
        }

        try {
            console.log('🤖 Making AI request to OpenRouter...')
            const siteConfig = getSiteConfig()
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': siteConfig.siteUrl,
                    'X-Title': siteConfig.siteName,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            })

            console.log('📡 OpenRouter response status:', response.status)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
                console.error('❌ OpenRouter API error:', errorData)
                throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`)
            }

            const data = await response.json()
            console.log('✅ OpenRouter response received')

            const content = data.choices?.[0]?.message?.content

            if (!content) {
                console.error('❌ No content in OpenRouter response:', data)
                throw new Error('No content received from AI')
            }

            console.log('🎉 AI content generated successfully')
            return {
                success: true,
                content: content.trim()
            }
        } catch (error) {
            console.error('💥 AI Service Error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown AI error'
            }
        }
    }

    // Generate comprehensive insights for dashboard data visualization
    async generateDashboardInsights(businessData: {
        totalCustomers: number
        totalVisits: number
        rewardsEarned: number
        averageVisitsPerCustomer: number
        topCustomers: Array<{ name: string; visits: number }>
        recentActivity: Array<{ date: string; visits: number }>
        businessName: string
        businessType?: string
        inactiveCustomers?: number
        pendingRewards?: number
        customerRetentionRate?: number
        visitTrends?: Array<{ period: string; visits: number; growth: number }>
    }): Promise<AIResponse> {
        const messages: AIMessage[] = [
            {
                role: 'system',
                content: `You are an expert business analytics consultant specializing in customer loyalty programs and business growth strategies. Analyze the data comprehensively and provide detailed, actionable insights that help business owners make informed decisions. Focus on customer retention, revenue optimization, and growth opportunities.`
            },
            {
                role: 'user',
                content: `Provide a comprehensive business analysis for ${businessData.businessName} (${businessData.businessType || 'Business'}):

📊 CORE METRICS:
- Total Customers: ${businessData.totalCustomers}
- Total Visits: ${businessData.totalVisits}
- Rewards Earned: ${businessData.rewardsEarned}
- Average Visits per Customer: ${businessData.averageVisitsPerCustomer.toFixed(1)}
- Inactive Customers: ${businessData.inactiveCustomers || 'Unknown'}
- Pending Rewards: ${businessData.pendingRewards || 'Unknown'}
- Customer Retention Rate: ${businessData.customerRetentionRate || 'Unknown'}%

👥 TOP PERFORMERS:
${businessData.topCustomers.map(c => `- ${c.name}: ${c.visits} visits`).join('\n')}

📈 RECENT ACTIVITY TRENDS:
${businessData.recentActivity.map(a => `- ${a.date}: ${a.visits} visits`).join('\n')}

${businessData.visitTrends ? `📊 VISIT TRENDS:
${businessData.visitTrends.map(t => `- ${t.period}: ${t.visits} visits (${t.growth > 0 ? '+' : ''}${t.growth}% change)`).join('\n')}` : ''}

Provide a detailed analysis covering:
1. 🎯 PERFORMANCE ASSESSMENT: Overall business health and key strengths
2. 📊 CUSTOMER BEHAVIOR INSIGHTS: Patterns and trends in customer engagement
3. 🚀 GROWTH OPPORTUNITIES: Specific strategies to increase visits and revenue
4. ⚠️ AREAS FOR IMPROVEMENT: Issues to address and optimization recommendations
5. 💡 ACTIONABLE NEXT STEPS: Immediate actions to implement this week

Make it comprehensive but easy to understand, with specific numbers and percentages where possible.`
            }
        ]

        return this.generateResponse(messages)
    }

    // Generate personalized email content based on business and customer data
    async generatePersonalizedEmail(context: {
        businessName: string
        businessType?: string
        customerName: string
        visitCount: number
        visitGoal: number
        rewardTitle: string
        isRewardReached: boolean
        customerHistory?: string
        emailType: 'visit_confirmation' | 'reward_earned' | 'inactive_reminder' | 'pending_reward_reminder'
        daysSinceLastVisit?: number
        pendingRewards?: number
        specialOffer?: string
    }): Promise<AIResponse> {
        const messages: AIMessage[] = [
            {
                role: 'system',
                content: `You are an expert email marketing copywriter specializing in customer loyalty programs. Create compelling, personalized email content that drives customer engagement and repeat visits. Use psychology-based persuasion techniques, create urgency when appropriate, and always make customers feel valued and special. Your emails should be warm, personal, and action-oriented.`
            },
            {
                role: 'user',
                content: `Create a highly engaging ${context.emailType.replace('_', ' ')} email:

�  BUSINESS: ${context.businessName}${context.businessType ? ` (${context.businessType})` : ''}
👤 CUSTOMER: ${context.customerName}
� LOYALTY PROGRESS: ${context.visitCount}/${context.visitGoal} visits completed
🎁 REWARD: ${context.rewardTitle}
${context.isRewardReached ? '🎉 REWARD EARNED & READY TO CLAIM!' : `📈 Only ${context.visitGoal - context.visitCount} more visit${context.visitGoal - context.visitCount === 1 ? '' : 's'} needed!`}
${context.daysSinceLastVisit ? `⏰ Last visit: ${context.daysSinceLastVisit} days ago` : ''}
${context.pendingRewards ? `🎁 Pending rewards to claim: ${context.pendingRewards}` : ''}
${context.specialOffer ? `🎯 Special offer: ${context.specialOffer}` : ''}

EMAIL TYPE REQUIREMENTS:
${context.emailType === 'visit_confirmation' ?
                        `VISIT CONFIRMATION: Thank them warmly, celebrate their progress with excitement, create anticipation for their reward, and encourage their next visit. If they've earned a reward, remind them to claim it!` :
                        context.emailType === 'reward_earned' ?
                            `REWARD EARNED: Create excitement and celebration! Give clear, simple instructions on how to claim their reward. Make them feel special and appreciated. Add urgency to claim soon.` :
                            context.emailType === 'pending_reward_reminder' ?
                                `PENDING REWARD REMINDER: Remind them they have unclaimed rewards waiting! Create urgency and excitement. Make it easy for them to come back and claim.` :
                                `INACTIVE CUSTOMER WIN-BACK: Create a compelling reason to return. Use emotional connection, mention what they're missing, offer something special, and create urgency. Make them feel missed and valued.`
                    }

REQUIREMENTS:
- Use warm, personal tone with their name
- Include relevant emojis to make it engaging
- Create emotional connection and excitement
- Include clear call-to-action
- Make it 2-4 sentences, concise but impactful
- Use urgency and scarcity when appropriate
- Make them feel special and valued

Write the email content only, no subject line needed.`
            }
        ]

        return this.generateResponse(messages)
    }

    // Generate business recommendations based on customer behavior
    async generateBusinessRecommendations(data: {
        businessName: string
        lowEngagementCustomers: number
        highEngagementCustomers: number
        averageDaysBetweenVisits: number
        peakVisitDays: string[]
        rewardRedemptionRate: number
    }): Promise<AIResponse> {
        const messages: AIMessage[] = [
            {
                role: 'system',
                content: `You are a business consultant specializing in customer retention and loyalty programs. Provide specific, actionable recommendations to improve customer engagement and business growth.`
            },
            {
                role: 'user',
                content: `Provide recommendations for ${data.businessName} based on this loyalty data:

📊 ENGAGEMENT:
- Low engagement customers: ${data.lowEngagementCustomers}
- High engagement customers: ${data.highEngagementCustomers}
- Average days between visits: ${data.averageDaysBetweenVisits}
- Peak visit days: ${data.peakVisitDays.join(', ')}
- Reward redemption rate: ${data.rewardRedemptionRate}%

Give 3-4 specific recommendations to:
1. Re-engage low-activity customers
2. Optimize reward structure
3. Improve visit frequency
4. Maximize peak day performance

Keep recommendations practical and implementable.`
            }
        ]

        return this.generateResponse(messages)
    }

    // Generate pending reward reminder email
    async generatePendingRewardReminder(context: {
        businessName: string
        businessType?: string
        customerName: string
        pendingRewards: number
        rewardTitle: string
        daysSinceEarned: number
    }): Promise<AIResponse> {
        return this.generatePersonalizedEmail({
            businessName: context.businessName,
            businessType: context.businessType,
            customerName: context.customerName,
            visitCount: 0, // Not relevant for this email type
            visitGoal: 0, // Not relevant for this email type
            rewardTitle: context.rewardTitle,
            isRewardReached: true,
            emailType: 'pending_reward_reminder',
            pendingRewards: context.pendingRewards,
            daysSinceLastVisit: context.daysSinceEarned
        })
    }

    // Generate inactive customer win-back email
    async generateWinBackEmail(context: {
        businessName: string
        businessType?: string
        customerName: string
        visitCount: number
        visitGoal: number
        rewardTitle: string
        daysSinceLastVisit: number
        specialOffer?: string
    }): Promise<AIResponse> {
        return this.generatePersonalizedEmail({
            businessName: context.businessName,
            businessType: context.businessType,
            customerName: context.customerName,
            visitCount: context.visitCount,
            visitGoal: context.visitGoal,
            rewardTitle: context.rewardTitle,
            isRewardReached: false,
            emailType: 'inactive_reminder',
            daysSinceLastVisit: context.daysSinceLastVisit,
            specialOffer: context.specialOffer
        })
    }
}

export const aiService = new AIService()
export default aiService