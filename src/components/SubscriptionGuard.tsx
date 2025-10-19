'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, Crown, Clock } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionGuardProps {
    children: React.ReactNode
    showTrialBanner?: boolean
}

export default function SubscriptionGuard({ children, showTrialBanner = true }: SubscriptionGuardProps) {
    const { business } = useAuth()
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (business) {
            checkSubscriptionStatus()
        }
    }, [business])

    const checkSubscriptionStatus = async () => {
        try {
            const response = await fetch(`/api/subscription-status?businessId=${business?.id}`)
            const result = await response.json()

            if (response.ok) {
                setSubscriptionStatus(result)
            }
        } catch (error) {
            console.error('Error checking subscription status:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking subscription...</p>
                </div>
            </div>
        )
    }

    // Block access if subscription is expired
    if (subscriptionStatus?.is_expired) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {subscriptionStatus.status === 'trial_expired'
                            ? 'Free Trial Expired'
                            : 'Subscription Expired'
                        }
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {subscriptionStatus.status === 'trial_expired'
                            ? 'Your 15-day free trial has ended. Subscribe now to continue using LoyalLink and manage your loyalty program.'
                            : 'Your subscription has expired. Renew now to continue accessing your loyalty program features.'
                        }
                    </p>

                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center mb-2">
                            <Crown className="w-6 h-6 mr-2" />
                            <span className="font-bold text-lg">Premium Plan</span>
                        </div>
                        <div className="text-3xl font-bold">₹499/month</div>
                        <p className="text-indigo-100 text-sm">All features included</p>
                    </div>

                    <Link
                        href="/payment"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all inline-block"
                    >
                        Subscribe Now
                    </Link>

                    <p className="text-xs text-gray-500 mt-4">
                        Secure payment • Cancel anytime
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Trial Banner */}
            {showTrialBanner && subscriptionStatus?.status === 'trial' && subscriptionStatus.days_left <= 7 && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            <span className="font-semibold">
                                Free trial ends in {subscriptionStatus.days_left} day{subscriptionStatus.days_left !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Link
                            href="/payment"
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                        >
                            Subscribe Now
                        </Link>
                    </div>
                </div>
            )}

            {children}
        </>
    )
}