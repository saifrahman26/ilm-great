'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Users, Target, Lightbulb, RefreshCw } from 'lucide-react'

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
                setIsAIGenerated(data.isAIGenerated !== false) // Default to true unless explicitly false
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Business Insights</h3>
                        <p className="text-sm text-gray-600">
                            {isAIGenerated ? 'AI-powered recommendations' : 'Smart analytics'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Analyzing...' : 'Refresh'}
                </button>
            </div>

            {/* Enhanced Quick Metrics */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Customers</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</p>
                        <p className="text-xs text-gray-500 mt-1">Total registered</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">Total Visits</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.totalVisits}</p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-600">Rewards</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.rewardsEarned}</p>
                        <p className="text-xs text-gray-500 mt-1">Earned</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-600">Avg Visits</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.averageVisitsPerCustomer}</p>
                        <p className="text-xs text-gray-500 mt-1">Per customer</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-600">Inactive</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.inactiveCustomers}</p>
                        <p className="text-xs text-gray-500 mt-1">30+ days</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-yellow-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-600">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.pendingRewards}</p>
                        <p className="text-xs text-gray-500 mt-1">Unclaimed rewards</p>
                    </div>
                </div>
            )}

            {/* AI Insights */}
            <div className="bg-white rounded-lg p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Smart Recommendations</h4>
                    {isAIGenerated && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            AI Generated
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Analyzing your business data...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-medium">Unable to generate insights</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button
                            onClick={generateInsights}
                            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : insights ? (
                    <div className="prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {insights}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-4">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Click "Refresh" to generate AI insights for your business</p>
                    </div>
                )}
            </div>

            {/* Business Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Top Customers */}
                {metrics?.topCustomers && metrics.topCustomers.length > 0 && (
                    <div className="bg-white rounded-lg p-6 border border-blue-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Customers</h4>
                        <div className="space-y-3">
                            {metrics.topCustomers.slice(0, 3).map((customer, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-900">{customer.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {customer.visits} visits
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visit Trends */}
                {metrics?.visitTrends && (
                    <div className="bg-white rounded-lg p-6 border border-blue-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Visit Trends</h4>
                        <div className="space-y-3">
                            {metrics.visitTrends.map((trend, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{trend.period}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${trend.growth > 0
                                            ? 'bg-green-100 text-green-700'
                                            : trend.growth < 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {trend.growth > 0 ? '+' : ''}{trend.growth}%
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {trend.visits} visits
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Retention Insights */}
            {metrics && (
                <div className="mt-6 bg-white rounded-lg p-6 border border-blue-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">👥 Customer Health</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{metrics.customerRetentionRate}%</div>
                            <div className="text-sm text-gray-600 mt-1">Retention Rate</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{metrics.pendingRewards}</div>
                            <div className="text-sm text-gray-600 mt-1">Pending Rewards</div>
                            <div className="text-xs text-gray-500 mt-1">Need follow-up</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{metrics.inactiveCustomers}</div>
                            <div className="text-sm text-gray-600 mt-1">Inactive Customers</div>
                            <div className="text-xs text-gray-500 mt-1">Win-back opportunity</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}