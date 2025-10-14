'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CompleteSetupPage() {
    const { user, business } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const completeSetup = async () => {
        if (!business?.id) {
            setError('No business found. Please try logging in again.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/complete-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: business.id
                })
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Failed to complete setup')
                return
            }

            setSuccess(true)

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)

        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Setup Complete! 🎉
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Your business setup has been completed successfully. You'll be redirected to your dashboard shortly.
                        </p>
                        <div className="text-sm text-gray-500">
                            Redirecting to dashboard...
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Complete Your Setup
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Your account was created but business setup didn't complete properly. Click the button below to finish setting up your loyalty program with default settings.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={completeSetup}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>Completing Setup...</span>
                                </>
                            ) : (
                                <span>Complete Business Setup</span>
                            )}
                        </button>

                        <p className="text-xs text-gray-500">
                            This will set up your loyalty program with default settings:
                            <br />• Reward: "Loyalty Reward"
                            <br />• Goal: 5 visits
                            <br />• You can customize these later in settings
                        </p>
                    </div>

                    {business && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Business: <strong>{business.name}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}