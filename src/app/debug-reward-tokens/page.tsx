'use client'

import { useState } from 'react'

export default function DebugRewardTokensPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [testToken, setTestToken] = useState('')

    const debugTokens = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/debug-reward-tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            const data = await response.json()
            setResult(data)

        } catch (error) {
            console.error('Debug tokens error:', error)
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const testSpecificToken = async () => {
        if (!testToken.trim()) {
            alert('Please enter a token to test')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`/api/claim-reward/${testToken.trim()}`)
            const data = await response.json()

            setResult({
                success: response.ok,
                message: response.ok ? 'Token found and valid' : 'Token test failed',
                tokenTest: {
                    token: testToken.trim(),
                    status: response.status,
                    found: response.ok,
                    error: data.error,
                    data: response.ok ? data : null
                }
            })

        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                tokenTest: {
                    token: testToken.trim(),
                    found: false
                }
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Debug Reward Tokens</h1>

                    <div className="space-y-4 mb-6">
                        <button
                            onClick={debugTokens}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Loading...' : 'Show All Reward Tokens in Database'}
                        </button>

                        <div className="border-t pt-4">
                            <h3 className="font-medium text-gray-900 mb-2">Test Specific Token:</h3>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={testToken}
                                    onChange={(e) => setTestToken(e.target.value)}
                                    placeholder="Enter reward token (e.g., 123456)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={testSpecificToken}
                                    disabled={loading || !testToken.trim()}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Test Token
                                </button>
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Results' : '❌ Error'}
                            </h3>

                            {result.rewards && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        Rewards in Database ({result.rewards.length}):
                                    </h4>
                                    <div className="space-y-2">
                                        {result.rewards.map((reward: any, index: number) => (
                                            <div key={index} className="bg-white p-3 rounded border text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div><strong>Token:</strong> {reward.claim_token}</div>
                                                    <div><strong>Status:</strong> {reward.status}</div>
                                                    <div><strong>Title:</strong> {reward.reward_title}</div>
                                                    <div><strong>Created:</strong> {new Date(reward.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div className="mt-2">
                                                    <strong>Test URL:</strong>
                                                    <a
                                                        href={`/claim-reward/${reward.claim_token}`}
                                                        target="_blank"
                                                        className="text-blue-600 hover:underline ml-2"
                                                    >
                                                        /claim-reward/{reward.claim_token}
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.tokenTest && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Token Test Results:</h4>
                                    <div className="bg-white p-3 rounded border text-sm">
                                        <div><strong>Token:</strong> {result.tokenTest.token}</div>
                                        <div><strong>Found:</strong> {result.tokenTest.found ? '✅ YES' : '❌ NO'}</div>
                                        <div><strong>Status:</strong> {result.tokenTest.status}</div>
                                        {result.tokenTest.error && (
                                            <div><strong>Error:</strong> {result.tokenTest.error}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {result.message || result.error}
                                </p>
                            </div>

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-600">Raw Data</summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">🔍 What This Shows:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>1. All reward tokens currently in the database</li>
                            <li>2. Their status (pending, claimed, etc.)</li>
                            <li>3. Direct links to test each token</li>
                            <li>4. Test specific tokens from QR codes</li>
                            <li>5. Compare email QR tokens with database tokens</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}