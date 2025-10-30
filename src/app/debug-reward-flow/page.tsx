'use client'

import { useState } from 'react'

export default function DebugRewardFlowPage() {
    const [customerId, setCustomerId] = useState('')
    const [businessId, setBusinessId] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const debugRewardFlow = async () => {
        if (!customerId || !businessId) {
            alert('Please enter both Customer ID and Business ID')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/debug-reward-flow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: customerId.trim(),
                    businessId: businessId.trim()
                })
            })

            const data = await response.json()

            setResult({
                success: response.ok,
                data: data,
                status: response.status
            })

        } catch (error) {
            console.error('Debug reward flow error:', error)
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Debug Reward Flow</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer ID
                            </label>
                            <input
                                type="text"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                placeholder="Enter customer ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business ID
                            </label>
                            <input
                                type="text"
                                value={businessId}
                                onChange={(e) => setBusinessId(e.target.value)}
                                placeholder="Enter business ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <button
                        onClick={debugRewardFlow}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Debugging...' : 'Debug Reward Flow'}
                    </button>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Debug Results' : '❌ Debug Error'}
                            </h3>

                            {result.success && result.data?.debug && (
                                <div className="mt-4 space-y-4">
                                    {/* Customer Info */}
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-semibold text-gray-800 mb-2">👤 Customer Info</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><strong>Name:</strong> {result.data.debug.customer.name}</div>
                                            <div><strong>Email:</strong> {result.data.debug.customer.email || 'No email'}</div>
                                            <div><strong>Current Visits:</strong> {result.data.debug.customer.currentVisits}</div>
                                            <div><strong>Has Email:</strong> {result.data.debug.customer.hasEmail ? '✅' : '❌'}</div>
                                        </div>
                                    </div>

                                    {/* Business Info */}
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-semibold text-gray-800 mb-2">🏪 Business Info</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><strong>Name:</strong> {result.data.debug.business.name}</div>
                                            <div><strong>Visit Goal:</strong> {result.data.debug.business.visitGoal}</div>
                                            <div><strong>Reward:</strong> {result.data.debug.business.rewardTitle}</div>
                                        </div>
                                    </div>

                                    {/* Visit Analysis */}
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-semibold text-gray-800 mb-2">📊 Visit Analysis</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><strong>Next Visit Count:</strong> {result.data.debug.visitAnalysis.newVisitCount}</div>
                                            <div><strong>Will Reach Goal:</strong> {result.data.debug.visitAnalysis.reachedGoal ? '🎉 YES' : '❌ NO'}</div>
                                            <div><strong>Reward Number:</strong> {result.data.debug.visitAnalysis.rewardNumber}</div>
                                            <div><strong>Modulo Result:</strong> {result.data.debug.visitAnalysis.moduloResult}</div>
                                        </div>
                                    </div>

                                    {/* Database Status */}
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-semibold text-gray-800 mb-2">💾 Database Status</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><strong>Rewards Table:</strong> {result.data.debug.database.rewardsTableExists ? '✅ Exists' : '❌ Missing'}</div>
                                            <div><strong>Existing Rewards:</strong> {result.data.debug.database.existingRewards}</div>
                                        </div>
                                    </div>

                                    {/* Email Test */}
                                    {result.data.debug.emailTest && (
                                        <div className="bg-white p-4 rounded border">
                                            <h4 className="font-semibold text-gray-800 mb-2">📧 Email Test</h4>
                                            <div className={`p-3 rounded ${result.data.debug.emailTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {result.data.debug.emailTest.success ? (
                                                    <div>✅ {result.data.debug.emailTest.message}</div>
                                                ) : (
                                                    <div>❌ {result.data.debug.emailTest.error}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!result.success && (
                                <div className="mt-3">
                                    <p className="text-red-700 text-sm">{result.error || result.data?.error}</p>
                                </div>
                            )}

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-600">Raw Debug Data</summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">💡 How to Use:</h3>
                        <ol className="text-sm text-blue-700 space-y-1">
                            <li>1. Find a customer ID from your customers page</li>
                            <li>2. Find your business ID from the dashboard</li>
                            <li>3. Enter both IDs and click "Debug Reward Flow"</li>
                            <li>4. Check if the next visit will trigger a reward</li>
                            <li>5. Verify email functionality and database status</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}