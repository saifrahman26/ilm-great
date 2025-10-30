'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Gift, Loader, User, Phone, Mail } from 'lucide-react'

interface RewardClaim {
    id: string
    customer_id: string
    business_id: string
    reward_title: string
    claim_token: string
    status: string
    created_at: string
}

interface Customer {
    id: string
    name: string
    email: string
    phone: string
}

interface Business {
    id: string
    name: string
    reward_title: string
    reward_description: string
}

function ClaimRewardContent() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [reward, setReward] = useState<RewardClaim | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchRewardData = async () => {
            if (!token) {
                setError('No reward token provided')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/claim-reward/${token}`)
                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Reward not found')
                } else {
                    setReward(result.reward)
                    setCustomer(result.customer)
                    setBusiness(result.business)
                }
            } catch (err) {
                setError('Failed to load reward information')
            }
            setLoading(false)
        }

        fetchRewardData()
    }, [token])

    const claimReward = async () => {
        if (!reward || claiming) return

        setClaiming(true)
        setError('')

        try {
            const response = await fetch(`/api/claim-reward/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            const result = await response.json()

            if (response.ok) {
                setSuccess(true)
                setReward(prev => prev ? { ...prev, status: 'claimed' } : null)
            } else {
                setError(result.error || 'Failed to claim reward')
            }
        } catch (err) {
            setError('Failed to claim reward')
        } finally {
            setClaiming(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading reward information...</p>
                </div>
            </div>
        )
    }

    if (error || !reward || !customer || !business) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error?.includes('already been claimed') ? 'Already Claimed' : 'Reward Not Found'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error?.includes('already been claimed')
                            ? 'This reward has already been claimed and cannot be used again.'
                            : error || 'This reward token is invalid or has expired'
                        }
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        )
    }

    if (success || reward.status === 'claimed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reward Claimed!</h2>
                    <p className="text-gray-600 mb-4">
                        {customer.name}'s reward has been successfully claimed.
                    </p>

                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Reward Details</h3>
                        <div className="text-left space-y-2">
                            <div className="flex items-center">
                                <Gift className="w-4 h-4 text-orange-600 mr-2" />
                                <span className="text-sm font-medium">{reward.reward_title}</span>
                            </div>
                            <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm">{customer.name}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs text-gray-500">Claimed at {business.name}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-4 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                            <Gift className="w-6 h-6 text-orange-600" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">Claim Reward</h1>
                        <p className="text-orange-100 text-sm">Verify and claim customer reward</p>
                    </div>

                    {/* Business Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b text-center">
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.reward_title}</p>
                    </div>

                    {/* Customer & Reward Info */}
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

                        {/* Reward Details */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-6 border border-orange-200">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-orange-900 mb-2">
                                    {reward.reward_title}
                                </h3>
                                <p className="text-orange-700 text-sm mb-3">
                                    {business.reward_description}
                                </p>
                                <div className="bg-white rounded-lg p-3 border border-orange-300">
                                    <p className="text-xs font-medium text-orange-800">
                                        Claim Token: {reward.claim_token}
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        Earned: {new Date(reward.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={claimReward}
                                disabled={claiming}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                            >
                                {claiming ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Claiming Reward...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Claim Reward</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
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
                        <li>1. Verify this is the correct customer and reward</li>
                        <li>2. Click "Claim Reward" to mark as redeemed</li>
                        <li>3. Provide the reward to the customer</li>
                        <li>4. Reward will be marked as claimed in the system</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default function ClaimRewardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <ClaimRewardContent />
        </Suspense>
    )
}