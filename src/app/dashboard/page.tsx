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
    User,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import RewardSetupPopup from '@/components/RewardSetupPopup'
import { useSetupGuard } from '@/hooks/useSetupGuard'

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

    // Calculate stats whenever customers data changes
    useEffect(() => {
        const totalCustomers = customers.length
        const totalVisits = customers.reduce((sum, customer) => sum + customer.visits, 0)
        const rewardsGiven = Math.floor(totalVisits / (business?.visit_goal || 5))
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
            {/* Clean Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Customers</p>
                            {loadingStats && customers.length === 0 ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2 w-16"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">All unique customers</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Returning Customers</p>
                            {loadingStats && customers.length === 0 ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2 w-16"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 mt-2">{customers.filter(c => c.visits > 1).length}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Customers with more than one visit</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Visits</p>
                            {loadingStats && customers.length === 0 ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2 w-16"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalVisits}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Across all customers</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Rewards Redeemed</p>
                            {loadingStats && customers.length === 0 ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2 w-16"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.rewardsGiven}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Based on {business?.visit_goal || 5} visits per reward</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Gift className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Progress */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customer Progress</h3>
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
                                    const progress = Math.min((customer.visits / (business?.visit_goal || 5)) * 100, 100)
                                    const isComplete = customer.visits >= (business?.visit_goal || 5)
                                    return (
                                        <div key={customer.id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                                                <span className="text-sm text-gray-500">
                                                    {customer.visits}/{business?.visit_goal || 5} visits
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-teal-500'
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            {isComplete && (
                                                <div className="flex items-center text-xs text-green-600">
                                                    <Gift className="w-3 h-3 mr-1" />
                                                    Reward earned!
                                                </div>
                                            )}
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

                {/* Enhanced Recent Check-ins */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                                Recent Check-ins
                            </h3>
                            <p className="text-sm text-gray-500">Your latest customer interactions.</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
                            <span>Customer</span>
                            <span>Visits</span>
                            <span>Last Visit</span>
                        </div>

                        {loadingStats && customers.length === 0 ? (
                            // Skeleton loading for recent check-ins
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                </div>
                            ))
                        ) : customers.length > 0 ? (
                            customers.slice(0, 5).map((customer) => (
                                <div key={customer.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                                            <span className="text-white font-semibold text-sm">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-900">{customer.name}</span>
                                    </div>
                                    <span className="text-gray-600">{customer.visits}</span>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(customer.last_visit).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No customers yet</p>
                                <Link href="/register" className="text-teal-600 hover:text-teal-700 text-sm">
                                    Add your first customer
                                </Link>
                            </div>
                        )}
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
