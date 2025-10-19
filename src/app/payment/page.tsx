'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CreditCard, CheckCircle, Clock, AlertTriangle, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function PaymentPage() {
    const { user, business } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
    const [loadingStatus, setLoadingStatus] = useState(true)

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
            setLoadingStatus(false)
        }
    }

    const handlePayment = async () => {
        if (!business) return

        setLoading(true)

        try {
            // Create payment order
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    planType: 'monthly'
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create payment')
            }

            // Load Razorpay script
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => {
                const options = {
                    key: result.key,
                    amount: result.amount,
                    currency: result.currency,
                    name: 'LoyalLink',
                    description: 'Monthly Subscription - ₹499',
                    order_id: result.order_id,
                    prefill: {
                        name: result.business_name,
                        email: result.business_email,
                    },
                    theme: {
                        color: '#6366f1'
                    },
                    handler: async function (response: any) {
                        // Verify payment
                        try {
                            const verifyResponse = await fetch('/api/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    business_id: business.id
                                })
                            })

                            const verifyResult = await verifyResponse.json()

                            if (verifyResponse.ok) {
                                alert('Payment successful! Your subscription is now active.')
                                router.push('/dashboard')
                            } else {
                                alert('Payment verification failed: ' + verifyResult.error)
                            }
                        } catch (error) {
                            alert('Payment verification failed. Please contact support.')
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false)
                        }
                    }
                }

                const rzp = new window.Razorpay(options)
                rzp.open()
            }
            document.body.appendChild(script)

        } catch (error) {
            alert('Failed to initiate payment: ' + (error instanceof Error ? error.message : 'Unknown error'))
            setLoading(false)
        }
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to access payment.</p>
                </div>
            </div>
        )
    }

    if (loadingStatus) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking subscription status...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">LoyalLink Subscription</h1>
                    <p className="text-xl text-gray-600">Manage your loyalty program with premium features</p>
                </div>

                {/* Subscription Status */}
                {subscriptionStatus && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Current Status</h2>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${subscriptionStatus.status === 'active' ? 'bg-green-100 text-green-800' :
                                    subscriptionStatus.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {subscriptionStatus.status === 'active' ? '✅ Active' :
                                    subscriptionStatus.status === 'trial' ? '🆓 Free Trial' :
                                        '⚠️ Expired'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-500">Days Remaining</p>
                                <p className="text-2xl font-bold text-gray-900">{subscriptionStatus.days_left}</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="text-sm text-gray-500">Plan Type</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subscriptionStatus.status === 'trial' ? 'Trial' : 'Premium'}
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CreditCard className="w-6 h-6 text-indigo-600" />
                                </div>
                                <p className="text-sm text-gray-500">Monthly Cost</p>
                                <p className="text-2xl font-bold text-gray-900">₹499</p>
                            </div>
                        </div>

                        {subscriptionStatus.is_expired && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                                    <p className="text-red-800 font-semibold">
                                        {subscriptionStatus.status === 'trial_expired'
                                            ? 'Your free trial has expired. Subscribe now to continue using LoyalLink.'
                                            : 'Your subscription has expired. Renew now to continue using premium features.'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pricing Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                        <h3 className="text-3xl font-bold mb-2">Premium Plan</h3>
                        <div className="text-5xl font-bold mb-2">₹499</div>
                        <p className="text-indigo-100">per month</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-gray-900 mb-4">What's included:</h4>
                            <ul className="space-y-3">
                                {[
                                    'Unlimited customers',
                                    'QR code generation',
                                    'Email notifications',
                                    'Visit tracking',
                                    'Reward management',
                                    'Analytics dashboard',
                                    'Customer management',
                                    'Mobile-friendly interface',
                                    'Email support'
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {subscriptionStatus?.status !== 'active' && (
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        <span>Subscribe Now</span>
                                    </>
                                )}
                            </button>
                        )}

                        {subscriptionStatus?.status === 'active' && (
                            <div className="text-center">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-green-800 font-semibold">You're all set!</p>
                                    <p className="text-green-700 text-sm">Your subscription is active and will renew automatically.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>Secure payment powered by Razorpay</p>
                            <p className="mt-1">Cancel anytime • No hidden fees</p>
                        </div>
                    </div>
                </div>

                {/* Free Trial Info */}
                {subscriptionStatus?.status === 'trial' && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">🎉 Enjoying your free trial?</h3>
                            <p className="text-blue-800 mb-4">
                                You have {subscriptionStatus.days_left} days left to explore all premium features.
                            </p>
                            <p className="text-blue-700 text-sm">
                                Subscribe before your trial ends to continue using LoyalLink without interruption.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}