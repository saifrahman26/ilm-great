'use client'

import { useState } from 'react'

export default function TestVisitLogicPage() {
    const [customerId, setCustomerId] = useState('')
    const [businessId, setBusinessId] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testVisitLogic = async () => {
        if (!customerId || !businessId) {
            alert('Please enter both Customer ID and Business ID')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/test-visit-logic', {
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
            console.error('Test visit logic error:', error)
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
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🧪 Test Visit Logic & Reward Email</h1>

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
                        onClick={testVisitLogic}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Testing...' : 'Test Visit Logic & Send Reward Email'}
                    </button>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Test Results' : '❌ Test Error'}
                            </h3>

                            {result.data?.testData && (
                                <div className="mt-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><strong>Customer:</strong> {result.data.testData.customer}</div>
                                        <div><strong>Email:</strong> {result.data.testData.email || 'No email'}</div>
                                        <div><strong>Current Visits:</strong> {result.data.testData.currentVisits}</div>
                                        <div><strong>Next Visit Count:</strong> {result.data.testData.newVisitCount}</div>
                                        <div><strong>Visit Goal:</strong> {result.data.testData.visitGoal}</div>
                                        <div><strong>Will Reach Goal:</strong> {result.data.testData.reachedGoal ? '🎉 YES' : '❌ NO'}</div>
                                    </div>

                                    {result.data.testData.reachedGoal && (
                                        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                                            <p className="text-yellow-800 font-medium">
                                                🎁 This customer SHOULD get a reward email on their next visit!
                                            </p>
                                            {result.data.testData.testToken && (
                                                <p className="text-yellow-700 text-sm mt-1">
                                                    Test token: {result.data.testData.testToken}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4">
                                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {result.data?.message || result.error}
                                </p>

                                {result.data?.emailError && (
                                    <p className="text-red-700 text-sm mt-2">
                                        Email Error: {result.data.emailError}
                                    </p>
                                )}
                            </div>

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-600">Raw Test Data</summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">🧪 What This Test Does:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>1. Calculates if next visit will reach reward goal</li>
                            <li>2. Tests the exact same logic as manual/QR visits</li>
                            <li>3. Actually sends a test reward email if goal is reached</li>
                            <li>4. Shows any errors in the email sending process</li>
                            <li>5. Helps debug why reward emails aren't working</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}