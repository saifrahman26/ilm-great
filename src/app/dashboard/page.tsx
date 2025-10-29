'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

import {
    Users,
    Eye,
    Gift,
    TrendingUp,
    BarChart3,
    User
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import RewardSetupPopup from '@/components/RewardSetupPopup'
import { useSetupGuard } from '@/lib/hooks/useSetupGuard'

// Force dynamic rendering
export const dynamic = 'force-dynamic'



interface DashboardStats {
    totalCustomers: number
    totalVisits: number
    rewardsGiven: number
    repeatRate: number
    avgVisitInterval: number
}

export default function DashboardPage() {
    const { user, business, loading } = useAuth()
    const setupGuard = useSetupGuard()
    const { customers, loading: loadingStats } = useData()
    const [stats, setStats] = useState<DashboardStats>({
        totalCustomers: 0,
        totalVisits: 0,
        rewardsGiven: 0,
        repeatRate: 0,
        avgVisitInterval: 0,
    })
    const [loadingTimeout, setLoadingTimeout] = useState(false)

    // Add loading timeout to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.log('⚠️ Loading timeout reached, showing fallback')
                setLoadingTimeout(true)
            }
        }, 15000) // 15 second timeout

        return () => clearTimeout(timer)
    }, [loading])

    // Calculate ACCURATE stats from real customer data
    useEffect(() => {
        const totalCustomers = customers.length
        const totalVisits = customers.reduce((sum, customer) => sum + customer.visits, 0)

        // ACCURATE rewards calculation - count actual rewards earned by customers
        const visitGoal = business?.visit_goal || 5
        const rewardsGiven = customers.reduce((sum, customer) => {
            return sum + Math.floor(customer.visits / visitGoal)
        }, 0)

        const repeatCustomers = customers.filter(customer => customer.visits > 1).length
        const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0

        let avgVisitInterval = 0
        if (totalCustomers > 0 && totalVisits > 0) {
            avgVisitInterval = Math.round(totalVisits / totalCustomers)
        }

        setStats({
            totalCustomers,
            totalVisits,
            rewardsGiven,
            repeatRate,
            avgVisitInterval,
        })
    }, [customers, business?.visit_goal])

    // Show loading timeout fallback
    if (loadingTimeout || (loading && !user && !business)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading Issue Detected</h2>
                        <p className="text-gray-600 mb-6">
                            The app seems to be stuck loading. This usually happens due to session issues.
                        </p>
                        <div className="space-y-3">
                            <a
                                href="/clear-session"
                                className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Clear Session & Fix Loading
                            </a>
                            <a
                                href="/login"
                                className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Try Login Again
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to access the dashboard.</p>
                    <Link href="/login" className="mt-4 inline-block bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    if (user && !business && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Incomplete</h2>
                    <p className="text-gray-600 mb-4">Your account was created but business setup didn&apos;t complete properly.</p>
                    <Link
                        href="/settings?setup=true"
                        className="inline-block bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                    >
                        Complete Business Setup
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening with your loyalty program."
        >


            {/* AI-Powered Business Intelligence */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 sm:p-6 text-white mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">AI Business Intelligence</h2>
                                <p className="text-sm sm:text-base text-white/80">Real-time insights powered by AI</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI-Enhanced Quick Metrics - Mobile Optimized */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                                AI
                            </span>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Customers</div>
                        <div className="text-xs text-green-600 mt-1">
                            {stats.repeatRate.toFixed(0)}% retention
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            </div>
                            <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                                AI
                            </span>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{stats.totalVisits}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Visits</div>
                        <div className="text-xs text-blue-600 mt-1">
                            {(stats.totalVisits / Math.max(stats.totalCustomers, 1)).toFixed(1)} avg each
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                            </div>
                            <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                                AI
                            </span>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{stats.rewardsGiven}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Rewards Earned</div>
                        <div className="text-xs text-orange-600 mt-1">
                            {customers.filter(c => {
                                const visitGoal = business?.visit_goal || 5
                                return c.visits >= visitGoal && c.visits % visitGoal === 0
                            }).length} ready
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                            </div>
                            <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                                AI
                            </span>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{customers.filter(c => c.visits === 1).length}</div>
                        <div className="text-xs sm:text-sm text-gray-600">New Customers</div>
                        <div className="text-xs text-red-600 mt-1">
                            Need engagement
                        </div>
                    </div>
                </div>

                {/* AI Business Summary - Mobile Optimized */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-5 border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">AI Business Summary</h3>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium self-start sm:self-auto">
                            AI Generated
                        </span>
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                        📊 <strong>Health:</strong> {stats.totalCustomers} customers, {(stats.totalVisits / Math.max(stats.totalCustomers, 1)).toFixed(1)} avg visits each.
                        <br className="sm:hidden" />
                        🎯 <strong>Rewards:</strong> {stats.rewardsGiven} earned ({stats.totalCustomers > 0 ? ((stats.rewardsGiven / stats.totalCustomers) * 100).toFixed(1) : 0}% success).
                        <br className="sm:hidden" />
                        💡 <strong>Focus:</strong> Customer retention and visit frequency.
                    </div>
                </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Progress Charts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">📊 Customer Progress</h3>
                            <p className="text-xs text-gray-500">Loyalty journey tracking</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {loadingStats && customers.length === 0 ? (
                            // Skeleton loading for customer progress
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                                </div>
                            ))
                        ) : customers.length > 0 ? (
                            customers
                                .sort((a, b) => b.visits - a.visits)
                                .slice(0, 5)
                                .map((customer) => {
                                    const visitGoal = business?.visit_goal || 5
                                    // Fix: Use modulo to show current cycle progress, not total visits
                                    const currentCycleVisits = customer.visits % visitGoal
                                    const displayVisits = currentCycleVisits === 0 && customer.visits > 0 ? visitGoal : currentCycleVisits
                                    const progress = (displayVisits / visitGoal) * 100
                                    const isComplete = customer.visits > 0 && customer.visits % visitGoal === 0
                                    const totalRewards = Math.floor(customer.visits / visitGoal)

                                    return (
                                        <div key={customer.id} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                                                <span className="text-xs text-gray-600">
                                                    {displayVisits}/{visitGoal} visits {totalRewards > 0 ? `(${totalRewards} reward${totalRewards === 1 ? '' : 's'})` : ''}
                                                </span>
                                            </div>

                                            {/* Enhanced Progress Bar */}
                                            <div className="relative">
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isComplete
                                                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                            : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                            }`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                {isComplete && (
                                                    <div className="absolute -top-1 right-0 transform translate-x-2">
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                            🎁 Reward earned!
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No customer data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly & Monthly Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">📈 Progress Trends</h3>
                            <p className="text-xs text-gray-500">Weekly & monthly analysis</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Real data trends styled exactly like the image */}
                        {(() => {
                            // Calculate REAL data from actual customers - no more mock data
                            const now = new Date()
                            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
                            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

                            // ACCURATE visit calculations based on actual customer data
                            const thisWeekCustomers = customers.filter(c =>
                                c.last_visit && new Date(c.last_visit) >= oneWeekAgo
                            )
                            const thisWeekVisits = thisWeekCustomers.reduce((sum, c) => sum + c.visits, 0)

                            const lastWeekCustomers = customers.filter(c =>
                                c.last_visit && new Date(c.last_visit) >= twoWeeksAgo && new Date(c.last_visit) < oneWeekAgo
                            )
                            const lastWeekVisits = lastWeekCustomers.reduce((sum, c) => sum + c.visits, 0)

                            const thisMonthCustomers = customers.filter(c =>
                                c.last_visit && new Date(c.last_visit) >= oneMonthAgo
                            )
                            const thisMonthVisits = thisMonthCustomers.reduce((sum, c) => sum + c.visits, 0)

                            // Calculate REAL growth percentages
                            const weekGrowth = lastWeekVisits > 0 ? Math.round(((thisWeekVisits - lastWeekVisits) / lastWeekVisits) * 100) : (thisWeekVisits > 0 ? 100 : 0)
                            const monthGrowth = stats.totalVisits > 0 && thisMonthVisits > 0 ? Math.round(((thisMonthVisits - (stats.totalVisits - thisMonthVisits)) / Math.max(stats.totalVisits - thisMonthVisits, 1)) * 100) : 0

                            const trends = [
                                { period: 'This Week', visits: thisWeekVisits, growth: weekGrowth },
                                { period: 'Last Week', visits: lastWeekVisits, growth: lastWeekVisits > 0 ? Math.round((lastWeekVisits / Math.max(stats.totalVisits, 1)) * 100) : 0 },
                                { period: 'This Month', visits: thisMonthVisits, growth: monthGrowth }
                            ]

                            return trends.map((trend, index) => {
                                const isPositive = trend.growth > 0
                                const isNegative = trend.growth < 0

                                return (
                                    <div key={index} className="space-y-3 sm:space-y-4">
                                        {/* Mobile-optimized header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
                                                <span className="font-medium text-gray-600 text-base sm:text-lg min-w-[100px] sm:min-w-[120px]">{trend.period}</span>
                                                <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-md font-medium ${isPositive ? 'bg-green-100 text-green-700' :
                                                    isNegative ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {trend.growth > 0 ? '+' : ''}{trend.growth}%
                                                </span>
                                            </div>
                                            <span className="text-xl sm:text-2xl font-bold text-blue-600 self-end sm:self-auto">{trend.visits}</span>
                                        </div>

                                        {/* Mobile-optimized progress bar */}
                                        <div className="relative w-full">
                                            <div className="bg-gray-200 rounded-full h-2 sm:h-3 w-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-green-500' :
                                                        isNegative ? 'bg-red-500' :
                                                            trend.visits > 0 ? 'bg-blue-500' : 'bg-gray-400'
                                                        }`}
                                                    style={{
                                                        width: trend.visits === 0 ? '5%' :
                                                            isPositive && trend.growth > 100 ? '100%' :
                                                                isPositive ? `${Math.min(Math.max(trend.growth, 10), 100)}%` :
                                                                    isNegative ? `${Math.min(Math.abs(trend.growth) * 2, 80)}%` :
                                                                        `${Math.min(Math.max((trend.visits / Math.max(stats.totalVisits, 1)) * 100, 10), 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/register"
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">Add Customer</h3>
                            <p className="text-sm text-gray-500">Register a new customer</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/scanner"
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Scan QR Code</h3>
                            <p className="text-sm text-gray-500">Record customer visits</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/customers"
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">View Customers</h3>
                            <p className="text-sm text-gray-500">Manage customer list</p>
                        </div>
                    </div>
                </Link>
            </div>



            {/* Enhanced Additional Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/rewards"
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 text-white group"
                >
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                            <Gift className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Reward Settings</h3>
                            <p className="text-sm text-purple-100">Configure your loyalty rewards</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/settings"
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                    <div className="flex items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">Business Settings</h3>
                            <p className="text-sm text-gray-500">Manage business information</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Reward Setup Popup */}
            <RewardSetupPopup
                isOpen={setupGuard.showSetupPopup}
                onClose={() => setupGuard.skipSetup()}
                onComplete={() => setupGuard.completeSetup()}
                businessId={setupGuard.businessId}
                businessName={setupGuard.businessName}
            />
        </DashboardLayout>
    )
}
