'use client'

import { useState } from 'react'

export default function TestRewardsTablePage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testRewardsTable = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/test-rewards-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            const data = await response.json()
            setResult(data)

        } catch (error) {
            console.error('Test rewards table error:', error)
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🧪 Test Rewards Table</h1>

                    <button
                        onClick={testRewardsTable}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Testing...' : 'Test Rewards Table & Create Sample Reward'}
                    </button>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Test Results' : '❌ Test Error'}
                            </h3>

                            <div className="mt-4">
                                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {result.message || result.error}
                                </p>
                            </div>

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-600">Raw Test Data</summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">🧪 What This Test Does:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>1. Checks if rewards table exists and is accessible</li>
                            <li>2. Lists existing rewards in the database</li>
                            <li>3. Creates a test reward with a sample token</li>
                            <li>4. Tests retrieving the reward by token</li>
                            <li>5. Shows any database errors or issues</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}