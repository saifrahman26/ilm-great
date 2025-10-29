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
        this.apiKey = process.env.OPENROUTER_API_KEY || ''
        if (!this.apiKey) {
            console.warn('⚠️ OPENROUTER_API_KEY not found in environment variables')
        }
    }

    async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
        if (!this.apiKey) {
            return {
                success: false,
                error: 'OpenRouter API key not configured'
            }
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://linkloyal.vercel.app',
                    'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'LinkLoyal',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`)
            }

            const data = await response.json()
            const content = data.choices?.[0]?.message?.content

            if (!content) {
                throw new Error('No content received from AI')
            }

            return {
                success: true,
                content: content.trim()
            }
        } catch (error) {
            console.error('AI Service Error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown AI error'
            }
        }
    }

    // Generate insights for dashboard data visualization
    async generateDashboardInsights(businessData: {
        totalCustomers: number
        totalVisits: number
        rewardsEarned: number
        averageVisitsPerCustomer: number
        topCustomers: Array<{ name: string; visits: number }>
        recentActivity: Array<{ date: string; visits: number }>
        businessName: string
        businessType?: string
    }): Promise<AIResponse> {
        const messages: AIMessage[] = [
            {
                role: 'system',
                content: `You are a business analytics expert specializing in customer loyalty programs. Provide actionable insights and recommendations based on loyalty program data. Keep responses concise, practical, and business-focused.`
            },
            {
                role: 'user',
                content: `Analyze this loyalty program data for ${businessData.businessName}:

📊 METRICS:
- Total Customers: ${businessData.totalCustomers}
- Total Visits: ${businessData.totalVisits}
- Rewards Earned: ${businessData.rewardsEarned}
- Average Visits per Customer: ${businessData.averageVisitsPerCustomer.toFixed(1)}

👥 TOP CUSTOMERS:
${businessData.topCustomers.map(c => `- ${c.name}: ${c.visits} visits`).join('\n')}

📈 RECENT ACTIVITY:
${businessData.recentActivity.map(a => `- ${a.date}: ${a.visits} visits`).join('\n')}

Provide 3-4 key insights and actionable recommendations to improve customer loyalty and business growth. Focus on practical strategies.`
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
        emailType: 'visit_confirmation' | 'reward_earned' | 'inactive_reminder'
    }): Promise<AIResponse> {
        const messages: AIMessage[] = [
            {
                role: 'system',
                content: `You are an expert email copywriter specializing in customer loyalty programs. Write engaging, personalized email content that builds customer relationships and encourages repeat visits. Keep the tone friendly, appreciative, and motivating. Focus on the customer's progress and make them feel valued.`
            },
            {
                role: 'user',
                content: `Write personalized email content for ${context.emailType.replace('_', ' ')}:

🏪 BUSINESS: ${context.businessName}${context.businessType ? ` (${context.businessType})` : ''}
👤 CUSTOMER: ${context.customerName}
📊 PROGRESS: ${context.visitCount}/${context.visitGoal} visits
🎁 REWARD: ${context.rewardTitle}
${context.isRewardReached ? '🎉 REWARD EARNED!' : `📈 ${context.visitGoal - context.visitCount} visits to go`}

${context.emailType === 'visit_confirmation' ?
                        'Write a warm thank you message for their visit, celebrate their progress, and motivate them to continue.' :
                        context.emailType === 'reward_earned' ?
                            'Write an exciting congratulations message for earning their reward with clear claim instructions.' :
                            'Write a friendly "we miss you" message to encourage them to return with a special offer.'
                    }

Keep it concise (2-3 sentences), personal, and engaging. Include relevant emojis.`
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
}

export const aiService = new AIService()
export default aiService