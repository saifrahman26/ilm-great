'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestRegistrationPage() {
    const { business } = useAuth()
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testRegistration = async () => {
        if (!business) return

        setLoading(true)
        try {
            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    name: 'Test Customer',
                    phone: `+1234567${Date.now().toString().slice(-3)}`, // Unique phone
                    email: 'test@example.com',
                    businessName: business.name,
                    rewardTitle: business.reward_title,
                    visitGoal: business.visit_goal
                })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ error: 'Network error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Test Customer Registration</h1>

                <button
                    onClick={testRegistration}
                    disabled={loading || !business}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Registration with First Visit'}
                </button>

                {result && (
                    <div className="mt-6 p-4 bg-gray-50 rounded">
                        <h3 className="font-medium mb-2">Result:</h3>
                        <pre className="text-sm overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded">
                    <h3 className="font-medium text-blue-900 mb-2">Expected Behavior:</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>✅ Customer created with visits = 1</li>
                        <li>✅ First visit recorded in visits table</li>
                        <li>✅ QR code generated and email sent</li>
                        <li>✅ Registration counts as first visit</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}