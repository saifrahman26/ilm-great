'use client'

import { useState } from 'react'

export default function TestRewardEmailPage() {
    const [email, setEmail] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testRewardEmail = async () => {
        if (!email) {
            alert('Please enter an email address')
            return
        }

        setLoading(true)
        setResult(null)

        try {

            // Test the reward token email via server-side API
            const response = await fetch('/api/test-reward-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    customerName: 'Test Customer',
                    businessName: 'Test Coffee Shop',
                    rewardTitle: 'Free Coffee'
                })
            })

            const data = await response.json()

            if (response.ok) {
                setResult({
                    success: true,
                    message: data.message,
                    details: data.details
                })
            } else {
                setResult({
                    success: false,
                    error: data.error,
                    details: data.details
                })
            }

        } catch (error) {
            console.error('Test reward email error:', error)
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: error
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🎁 Test Reward Email</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="test@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={testRewardEmail}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Sending Test Reward Email...' : 'Send Test Reward Email'}
                        </button>
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Success' : '❌ Error'}
                            </h3>
                            <p className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                {result.success ? result.message : result.error}
                            </p>

                            {result.details && (
                                <div className="mt-3">
                                    <h4 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                        Details:
                                    </h4>
                                    <pre className={`mt-1 text-xs ${result.success ? 'text-green-600' : 'text-red-600'} bg-white p-2 rounded border overflow-auto`}>
                                        {JSON.stringify(result.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">Test Details:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Customer: Test Customer</li>
                            <li>• Business: Test Coffee Shop</li>
                            <li>• Reward: Free Coffee</li>
                            <li>• Token: 123456</li>
                            <li>• Email Type: Premium Reward Token Email</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}