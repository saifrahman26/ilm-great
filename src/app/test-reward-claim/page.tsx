'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'

export default function TestRewardClaimPage() {
    const { user, business } = useAuth()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [testToken, setTestToken] = useState('')
    const [claimResult, setClaimResult] = useState<any>(null)

    const generateTestReward = async () => {
        if (!business?.id) return

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/test-generate-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: business.id })
            })

            const data = await response.json()
            setResult(data)

            if (data.success) {
                setTestToken(data.token)
            }
        } catch (error) {
            setResult({ error: 'Failed to generate test reward' })
        } finally {
            setLoading(false)
        }
    }

    const testClaimReward = async () => {
        if (!business?.id || !testToken) return

        setLoading(true)
        setClaimResult(null)

        try {
            const response = await fetch('/api/claim-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: testToken,
                    businessId: business.id
                })
            })

            const data = await response.json()
            setClaimResult(data)
        } catch (error) {
            setClaimResult({ error: 'Failed to claim reward' })
        } finally {
            setLoading(false)
        }
    }

    const checkRewardsTable = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/test-rewards-table')
            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ error: 'Failed to check rewards table' })
        } finally {
            setLoading(false)
        }
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to test reward claims.</p>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout title="Test Reward Claim" subtitle="Debug and test the reward claiming system">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Check Rewards Table */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">1. Check Rewards Table</h3>
                    <button
                        onClick={checkRewardsTable}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Checking...' : 'Check Rewards Table'}
                    </button>
                </div>

                {/* Generate Test Reward */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">2. Generate Test Reward Token</h3>
                    <button
                        onClick={generateTestReward}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Test Reward'}
                    </button>

                    {testToken && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="font-semibold text-green-800">Test Token Generated:</p>
                            <p className="text-2xl font-mono text-green-900">{testToken}</p>
                        </div>
                    )}
                </div>

                {/* Test Claim Reward */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">3. Test Claim Reward</h3>
                    <div className="flex gap-4 items-center mb-4">
                        <input
                            type="text"
                            value={testToken}
                            onChange={(e) => setTestToken(e.target.value)}
                            placeholder="Enter 6-digit token"
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            maxLength={6}
                        />
                        <button
                            onClick={testClaimReward}
                            disabled={loading || !testToken}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Claiming...' : 'Test Claim'}
                        </button>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4">Generation Result</h3>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                {claimResult && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4">Claim Result</h3>
                        <pre className={`p-4 rounded-lg overflow-auto text-sm ${claimResult.success ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {JSON.stringify(claimResult, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}