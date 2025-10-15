'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestRewardsAPI() {
    const { user, business } = useAuth()
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const testAPI = async () => {
        if (!business || !user) {
            setResult('❌ No business or user found')
            return
        }

        setLoading(true)
        setResult('🔄 Testing API...')

        try {
            const response = await fetch('/api/update-rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: business.id,
                    userId: user.id,
                    reward_title: 'Test Reward',
                    reward_description: 'This is a test reward to verify the API is working',
                    visit_goal: 5
                })
            })

            const data = await response.json()

            setResult(`
📡 Response Status: ${response.status}
📋 Response Data: ${JSON.stringify(data, null, 2)}
👤 User ID: ${user.id}
🏢 Business ID: ${business.id}
            `)
        } catch (error) {
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Test Rewards API</h1>

                <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                    <h2 className="text-lg font-semibold mb-4">Current Context</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
                        <p><strong>Business ID:</strong> {business?.id || 'No business'}</p>
                        <p><strong>Business Name:</strong> {business?.name || 'No business'}</p>
                        <p><strong>Current Reward Title:</strong> {business?.reward_title || 'None'}</p>
                        <p><strong>Current Reward Description:</strong> {business?.reward_description || 'None'}</p>
                        <p><strong>Current Visit Goal:</strong> {business?.visit_goal || 'None'}</p>
                    </div>
                </div>

                <button
                    onClick={testAPI}
                    disabled={loading || !business || !user}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
                >
                    {loading ? 'Testing...' : 'Test Update Rewards API'}
                </button>

                {result && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                        {result}
                    </div>
                )}
            </div>
        </div>
    )
}