'use client'

import { useState } from 'react'

export default function TestMarkVisitPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testAPI = async () => {
        setLoading(true)
        setResult(null)

        try {
            const testData = {
                customerId: 'test-customer-123',
                businessId: 'test-business-456'
            }

            console.log('🧪 Testing with data:', testData)

            const response = await fetch('/api/test-record-visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            })

            const result = await response.json()
            console.log('🧪 Test result:', result)

            setResult({
                status: response.status,
                ok: response.ok,
                data: result
            })

        } catch (error) {
            console.error('🧪 Test error:', error)
            setResult({
                status: 'error',
                error: error
            })
        } finally {
            setLoading(false)
        }
    }

    const testRealAPI = async () => {
        setLoading(true)
        setResult(null)

        try {
            const testData = {
                customerId: 'test-customer-123',
                businessId: 'test-business-456'
            }

            console.log('🧪 Testing real API with data:', testData)

            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            })

            const result = await response.json()
            console.log('🧪 Real API result:', result)

            setResult({
                status: response.status,
                ok: response.ok,
                data: result
            })

        } catch (error) {
            console.error('🧪 Real API error:', error)
            setResult({
                status: 'error',
                error: error
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Mark Visit API</h1>

                <div className="space-y-4 mb-8">
                    <button
                        onClick={testAPI}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Test API (Mock)'}
                    </button>

                    <button
                        onClick={testRealAPI}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 ml-4"
                    >
                        {loading ? 'Testing...' : 'Test Real API'}
                    </button>
                </div>

                {result && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Test Result</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}