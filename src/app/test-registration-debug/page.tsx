'use client'

import { useState } from 'react'

export default function TestRegistrationDebug() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testRegistration = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('🧪 Testing registration API...')

            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: '7952cb32-f70c-4a89-8c1c-8c29d326210a',
                    name: 'Test Customer Debug',
                    phone: '9999999999',
                    email: 'warriorsaifdurer@gmail.com'
                })
            })

            console.log('📥 Response status:', response.status)
            const data = await response.json()
            console.log('📥 Response data:', data)

            setResult({
                status: response.status,
                ok: response.ok,
                data: data
            })
        } catch (error) {
            console.error('❌ Test error:', error)
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🧪 Registration API Debug Test
                    </h1>

                    <button
                        onClick={testRegistration}
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Test Registration API'}
                    </button>

                    {result && (
                        <div className="mt-6 p-4 bg-gray-100 rounded-md">
                            <h3 className="font-medium text-gray-900 mb-2">Result:</h3>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                        <h3 className="font-medium text-blue-900 mb-2">Test Details:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Business ID: 7952cb32-f70c-4a89-8c1c-8c29d326210a</li>
                            <li>• Name: Test Customer Debug</li>
                            <li>• Phone: 9999999999</li>
                            <li>• Email: warriorsaifdurer@gmail.com</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}