'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, User, Gift, Loader, ArrowLeft, Phone, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Customer {
    id: string
    name: string
    email: string
    phone: string
    visits: number
    business_id: string
}

interface Business {
    id: string
    name: string
    reward_title: string
    reward_description: string
    visit_goal: number
}

function MarkVisitContent() {
    const params = useParams()
    const router = useRouter()
    const { user, business: userBusiness } = useAuth()
    const customerId = params.customerId as string

    const [customer, setCustomer] = useState<Customer | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [recording, setRecording] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [visitRecorded, setVisitRecorded] = useState(false)

    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!customerId) {
                setError('No customer ID provided')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/customer/${customerId}`)
                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Customer not found')
                } else {
                    setCustomer(result.customer)
                    setBusiness(result.business)
                }
            } catch (err) {
                setError('Failed to load customer information')
            }
            setLoading(false)
        }

        fetchCustomerData()
    }, [customerId])

    const recordVisit = async () => {
        if (!customer || !user || recording || visitRecorded) return

        // Check if user's business matches customer's business
        if (userBusiness?.id !== customer.business_id) {
            setError('This customer belongs to a different business')
            return
        }

        setRecording(true)
        setError('')

        try {
            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: customer.id,
                    businessId: customer.business_id
                })
            })

            const result = await response.json()

            if (response.ok) {
                setSuccess(true)
                setVisitRecorded(true)
                // Update customer visits count
                setCustomer(prev => prev ? { ...prev, visits: prev.visits + 1 } : null)
            } else {
                setError(result.error || 'Failed to record visit')
            }
        } catch (err) {
            setError('Failed to record visit')
        } finally {
            setRecording(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading customer information...</p>
                </div>
            </div>
        )
    }

    if (error || !customer || !business) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error || 'Customer or business information not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    // Calculate progress
    const visitGoal = business.visit_goal
    const currentCycleVisits = customer.visits % visitGoal
    const displayVisits = currentCycleVisits === 0 && customer.visits > 0 ? visitGoal : currentCycleVisits
    const progressPercentage = (displayVisits / visitGoal) * 100
    const totalRewards = Math.floor(customer.visits / visitGoal)
    const willEarnReward = (customer.visits + 1) % visitGoal === 0

    if (success && visitRecorded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Recorded!</h2>
                    <p className="text-gray-600 mb-4">
                        {customer.name}'s visit has been successfully recorded.
                    </p>

                    {willEarnReward && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-center mb-2">
                                <Gift className="w-6 h-6 text-yellow-600 mr-2" />
                                <span className="font-semibold text-yellow-800">Reward Earned!</span>
                            </div>
                            <p className="text-yellow-700 text-sm">
                                {customer.name} has completed {visitGoal} visits and earned: {business.reward_title}
                            </p>
                        </div>
                    )}

                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Updated Progress</h3>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Visits: {customer.visits + 1}</span>
                            <span>Goal: {visitGoal}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(((customer.visits + 1) % visitGoal || visitGoal) / visitGoal * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/scanner')}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Scan Another Customer
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">Record Visit</h1>
                        <p className="text-blue-100 text-sm">Confirm customer visit</p>
                    </div>

                    {/* Business Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b text-center">
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.reward_title}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="px-6 py-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{customer.name}</h2>
                            <div className="space-y-2">
                                {customer.phone && (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span className="text-sm">{customer.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Progress */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <Gift className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-gray-900">Current Progress</span>
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    {displayVisits} / {visitGoal} visits
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>

                            <p className="text-sm text-gray-600 text-center">
                                {displayVisits >= visitGoal
                                    ? `🎉 Ready to claim: ${business.reward_title}!`
                                    : `${visitGoal - displayVisits} more visit${visitGoal - displayVisits === 1 ? '' : 's'} to earn reward`
                                }
                            </p>

                            {totalRewards > 0 && (
                                <p className="text-xs text-green-600 text-center mt-2">
                                    Total rewards earned: {totalRewards}
                                </p>
                            )}
                        </div>

                        {/* After Visit Preview */}
                        {willEarnReward && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <Gift className="w-5 h-5 text-yellow-600 mr-2" />
                                    <span className="font-semibold text-yellow-800">Will Earn Reward!</span>
                                </div>
                                <p className="text-yellow-700 text-sm text-center">
                                    This visit will complete {visitGoal} visits and earn: {business.reward_title}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {!user ? (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">Please log in to record visits</p>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Log In
                                    </button>
                                </div>
                            ) : userBusiness?.id !== customer.business_id ? (
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">This customer belongs to a different business</p>
                                    <button
                                        onClick={() => router.back()}
                                        className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={recordVisit}
                                        disabled={recording || visitRecorded}
                                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                                    >
                                        {recording ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                <span>Recording Visit...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Mark Visit</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => router.back()}
                                        className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        <span>Cancel</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm text-center">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>1. Verify this is the correct customer</li>
                        <li>2. Click "Mark Visit" to record their visit</li>
                        <li>3. Customer will receive confirmation via email/SMS</li>
                        <li>4. Rewards are automatically tracked</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default function MarkVisitPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <MarkVisitContent />
        </Suspense>
    )
}