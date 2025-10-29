'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Users, Target, AlertCircle, RefreshCw, Brain, Award, Calendar, Activity } from 'lucide-react'

interface AIDashboardInsightsProps {
    businessId: string
}

interface DashboardMetrics {
    totalCustomers: number
    totalVisits: number
    rewardsEarned: number
    averageVisitsPerCustomer: number
    topCustomers: Array<{ name: string; visits: number }>
    recentActivity: Array<{ date: string; visits: number }>
    inactiveCustomers: number
    pendingRewards: number
    customerRetentionRate: number
    visitTrends: Array<{ period: string; visits: number; growth: number }>
}

export default function AIDashboardInsights({ businessId }: AIDashboardInsightsProps) {
    const [insights, setInsights] = useState<string>('')
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isAIGenerated, setIsAIGenerated] = useState(false)

    const generateInsights = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/ai/dashboard-insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ businessId })
            })

            const data = await response.json()

            if (data.success) {
                setInsights(data.insights || 'No insights available')
                setMetrics(data.metrics)
                setIsAIGenerated(data.isAIGenerated !== false)
                if (data.error) {
                    console.warn('AI generation failed, using fallback:', data.error)
                }
            } else {
                setError(data.error || 'Failed to generate insights')
            }
        } catch (err) {
            setError('Failed to connect to AI service')
            console.error('AI insights error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (businessId) {
            generateInsights()
        }
    }, [businessId])

    if (!businessId) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* AI-Powered Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">AI Business Dashboard</h2>
                            <p className="text-white/80">Real-time insights powered by artificial intelligence</p>
                        </div>
                    </div>
                    <button
                        onClick={generateInsights}
                        disabled={loading}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Analyzing...' : 'Refresh AI'}
                    </button>
                </div>
            </div>

            {/* AI-Enhanced Metrics Grid */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                                AI Analyzed
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.totalCustomers}</div>
                        <div className="text-sm text-gray-600">Total Customers</div>
                        <div className="text-xs text-green-600 mt-2">
                            {metrics.customerRetentionRate}% retention rate
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Activity className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
                                AI Tracked
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.totalVisits}</div>
                        <div className="text-sm text-gray-600">Total Visits</div>
                        <div className="text-xs text-blue-600 mt-2">
                            {metrics.averageVisitsPerCustomer.toFixed(1)} avg per customer
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">
                                AI Optimized
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.rewardsEarned}</div>
                        <div className="text-sm text-gray-600">Rewards Earned</div>
                        <div className="text-xs text-orange-600 mt-2">
                            {metrics.pendingRewards} pending claims
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium">
                                AI Alert
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.inactiveCustomers}</div>
                        <div className="text-sm text-gray-600">Inactive Customers</div>
                        <div className="text-xs text-red-600 mt-2">
                            Need re-engagement
                        </div>
                    </div>
                </div>
            )}

            {/* AI Business Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Progress Charts */}
                {metrics?.topCustomers && metrics.topCustomers.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">📊 Customer Progress</h3>
                                <p className="text-xs text-gray-500">Loyalty journey tracking</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {metrics.topCustomers.slice(0, 5).map((customer, index) => {
                                const progressPercentage = Math.min((customer.visits / 5) * 100, 100) // Assuming 5 visit goal
                                const isRewardEarned = customer.visits >= 5

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                                            <span className="text-xs text-gray-600">{customer.visits}/5 visits</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative">
                                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isRewardEarned
                                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                        }`}
                                                    style={{ width: `${progressPercentage}%` }}
                                                ></div>
                                            </div>
                                            {isRewardEarned && (
                                                <div className="absolute -top-1 right-0 transform translate-x-2">
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                        🎁 Reward earned!
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Weekly & Monthly Progress */}
                {metrics?.visitTrends && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">📈 Progress Trends</h3>
                                <p className="text-xs text-gray-500">Weekly & monthly analysis</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {metrics.visitTrends.map((trend, index) => {
                                const isPositive = trend.growth > 0
                                const isNegative = trend.growth < 0
                                const progressWidth = Math.min(Math.abs(trend.growth) * 2, 100) // Scale for visual

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm">{trend.period}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isPositive ? 'bg-green-100 text-green-700' :
                                                        isNegative ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {trend.growth > 0 ? '+' : ''}{trend.growth}%
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600">{trend.visits}</span>
                                        </div>

                                        {/* Progress Visualization */}
                                        <div className="relative">
                                            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                            isNegative ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                                                'bg-gradient-to-r from-gray-400 to-gray-600'
                                                        }`}
                                                    style={{ width: `${Math.max(progressWidth, 10)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Customer Health - AI Insights */}
                {metrics && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">👥 Customer Health</h3>
                                <p className="text-xs text-gray-500">AI health score</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <div className="text-lg font-bold text-green-600">{metrics.customerRetentionRate}%</div>
                                    <div className="text-xs text-gray-600">Retention Rate</div>
                                </div>
                                <div className="text-green-600">✅</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div>
                                    <div className="text-lg font-bold text-yellow-600">{metrics.pendingRewards}</div>
                                    <div className="text-xs text-gray-600">Pending Rewards</div>
                                </div>
                                <div className="text-yellow-600">⏳</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div>
                                    <div className="text-lg font-bold text-red-600">{metrics.inactiveCustomers}</div>
                                    <div className="text-xs text-gray-600">Need Attention</div>
                                </div>
                                <div className="text-red-600">⚠️</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Insights Summary - Short and Sweet */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        <span className="text-gray-600">AI is analyzing your business...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-4">
                        <div className="text-red-500 mb-2">❌ AI Analysis Failed</div>
                        <button onClick={generateInsights} className="text-blue-600 hover:text-blue-800 text-sm underline">
                            Try Again
                        </button>
                    </div>
                ) : insights ? (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">AI Business Summary</h3>
                            {isAIGenerated && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                    AI Generated
                                </span>
                            )}
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed">
                            {insights.split('\n').slice(0, 3).join(' ').substring(0, 200)}...
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Click "Refresh AI" to get business insights</p>
                    </div>
                )}
            </div>

            {/* AI Footer Note */}
            <div className="text-center py-4">
                <p className="text-xs text-gray-500">
                    🤖 <strong>Powered by AI:</strong> This dashboard uses artificial intelligence to analyze your business data,
                    track customer behavior, and provide actionable insights for growth.
                </p>
            </div>
        </div>
    )
}