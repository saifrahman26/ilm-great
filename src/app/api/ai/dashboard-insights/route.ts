import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiService } from '@/lib/ai'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: NextRequest) {
    try {
        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json(
                { success: false, error: 'Business ID is required' },
                { status: 400 }
            )
        }

        // Get business info
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { success: false, error: 'Business not found' },
                { status: 404 }
            )
        }

        // Get customer data
        const { data: customers, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)

        if (customersError) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch customers' },
                { status: 500 }
            )
        }

        // Calculate metrics
        const totalCustomers = customers?.length || 0
        const totalVisits = customers?.reduce((sum, customer) => sum + (customer.visits || 0), 0) || 0
        const rewardsEarned = customers?.filter(customer =>
            (customer.visits || 0) >= (business.visit_goal || 5)
        ).length || 0
        const averageVisitsPerCustomer = totalCustomers > 0 ? totalVisits / totalCustomers : 0

        // Get top customers
        const topCustomers = customers
            ?.sort((a, b) => (b.visits || 0) - (a.visits || 0))
            .slice(0, 5)
            .map(customer => ({
                name: customer.name || 'Unknown',
                visits: customer.visits || 0
            })) || []

        // Get recent activity (mock data for now - you can implement actual visit tracking)
        const recentActivity = [
            { date: 'Today', visits: Math.floor(Math.random() * 10) + 1 },
            { date: 'Yesterday', visits: Math.floor(Math.random() * 15) + 1 },
            { date: '2 days ago', visits: Math.floor(Math.random() * 12) + 1 },
            { date: '3 days ago', visits: Math.floor(Math.random() * 8) + 1 },
            { date: '4 days ago', visits: Math.floor(Math.random() * 6) + 1 }
        ]

        // Calculate additional metrics
        const inactiveCustomers = customers?.filter(customer => {
            if (!customer.last_visit) return true
            const lastVisit = new Date(customer.last_visit)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            return lastVisit < thirtyDaysAgo
        }).length || 0

        const pendingRewards = rewardsEarned // For now, assume all earned rewards are pending
        const customerRetentionRate = totalCustomers > 0 ? Math.round(((totalCustomers - inactiveCustomers) / totalCustomers) * 100) : 0

        // Mock visit trends
        const visitTrends = [
            { period: 'This Week', visits: Math.floor(Math.random() * 50) + 20, growth: Math.floor(Math.random() * 20) - 10 },
            { period: 'Last Week', visits: Math.floor(Math.random() * 45) + 15, growth: Math.floor(Math.random() * 15) - 5 },
            { period: 'This Month', visits: Math.floor(Math.random() * 200) + 100, growth: Math.floor(Math.random() * 25) - 10 }
        ]

        // Generate AI insights
        const businessData = {
            totalCustomers,
            totalVisits,
            rewardsEarned,
            averageVisitsPerCustomer,
            topCustomers,
            recentActivity,
            businessName: business.name || 'Your Business',
            businessType: business.business_type,
            inactiveCustomers,
            pendingRewards,
            customerRetentionRate,
            visitTrends
        }

        try {
            console.log('🤖 Generating AI insights for business:', business.name)
            const aiResponse = await aiService.generateDashboardInsights(businessData)

            if (aiResponse.success) {
                return NextResponse.json({
                    success: true,
                    insights: aiResponse.content,
                    isAIGenerated: true,
                    metrics: {
                        totalCustomers,
                        totalVisits,
                        rewardsEarned,
                        averageVisitsPerCustomer: parseFloat(averageVisitsPerCustomer.toFixed(1)),
                        topCustomers,
                        recentActivity,
                        inactiveCustomers,
                        pendingRewards,
                        customerRetentionRate,
                        visitTrends
                    }
                })
            } else {
                console.warn('AI insights failed, using fallback:', aiResponse.error)
                throw new Error(aiResponse.error || 'AI generation failed')
            }
        } catch (aiError) {
            console.error('AI insights error:', aiError)

            // Provide fallback insights
            const fallbackInsights = [
                `📈 You have ${totalCustomers} loyal customers with an average of ${averageVisitsPerCustomer.toFixed(1)} visits each.`,
                `🎯 ${rewardsEarned} customers have earned rewards - that's a ${totalCustomers > 0 ? ((rewardsEarned / totalCustomers) * 100).toFixed(1) : 0}% success rate!`,
                `👑 Your top customer has ${topCustomers[0]?.visits || 0} visits. Consider recognizing your most loyal customers.`,
                `💡 Focus on increasing visit frequency to boost customer lifetime value.`,
                `⚠️ ${inactiveCustomers} customers haven't visited in 30+ days - consider a win-back campaign.`
            ].join('\n\n')

            return NextResponse.json({
                success: true,
                insights: fallbackInsights,
                isAIGenerated: false,
                error: aiError instanceof Error ? aiError.message : 'AI unavailable',
                metrics: {
                    totalCustomers,
                    totalVisits,
                    rewardsEarned,
                    averageVisitsPerCustomer: parseFloat(averageVisitsPerCustomer.toFixed(1)),
                    topCustomers,
                    recentActivity,
                    inactiveCustomers,
                    pendingRewards,
                    customerRetentionRate,
                    visitTrends
                }
            })
        }

    } catch (error) {
        console.error('Dashboard insights error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}