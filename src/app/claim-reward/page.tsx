'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Gift, CheckCircle, AlertCircle, User, Phone, Mail, Trophy } from 'lucide-react'

export default function ClaimRewardPage() {
    const { user, business } = useAuth()
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState<any>(null)

    const handleClaimReward = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token.trim()) {
            setError('Please enter a reward token')
            return
        }

        if (!business) {
            setError('Business information not found')
            return
        }

        setLoading(true)
        setError('')
        setSuccess(null)

        try {
            const response = await fetch('/api/claim-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token.trim(),
                    businessId: business.id
                })
            })

            const result = await response.json()

            if (response.ok) {
                setSuccess(result)
                setToken('')
            } else {
                setError(result.error || 'Failed to claim reward')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to access reward claims.</p>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout title="Claim Reward" subtitle="Enter customer reward tokens to process claims">
            <div className="max-w-2xl mx-auto">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-900 mb-2">🎉 Reward Claimed!</h2>
                            <p className="text-green-700">The reward has been successfully processed</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">Customer Details:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium text-gray-900">{success.customer?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{success.customer?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{success.customer?.email || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Gift className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Reward</p>
                                        <p className="font-medium text-gray-900">{success.reward?.reward_title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>Note:</strong> Customer's visit count has been reset to 0. They can now start earning towards their next reward!
                            </p>
                        </div>
                    </div>
                )}

                {/* Claim Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Process Reward Claim</h2>
                        <p className="text-gray-600">Enter the 6-digit token provided by the customer</p>
                    </div>

                    <form onSubmit={handleClaimReward} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reward Token *
                            </label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => {
                                    setToken(e.target.value.replace(/\D/g, '').slice(0, 6))
                                    setError('')
                                }}
                                placeholder="Enter 6-digit token"
                                className="w-full px-4 py-4 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tracking-widest text-black placeholder-gray-400"
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Customer should provide this token from their reward email
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || token.length !== 6}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Claim Reward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 rounded-lg p-6">
                        <h3 className="font-bold text-blue-900 mb-3">How it works:</h3>
                        <ol className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                                <span>Customer reaches {business.visit_goal} visits and earns a reward</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                                <span>They receive a 6-digit token via email</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                                <span>Customer shows you the token</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                                <span>Enter the token here to process their reward</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}