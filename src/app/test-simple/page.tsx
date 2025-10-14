'use client'

import { useState } from 'react'

export default function TestSimplePage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testAPI = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/health')
            const data = await response.json()

            setResult({
                success: response.ok,
                status: response.status,
                data: data,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            })
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🧪 Simple App Test
                    </h1>

                    <div className="space-y-4">
                        <button
                            onClick={testAPI}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test API Health'}
                        </button>

                        {result && (
                            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.success ? '✅ Success!' : '❌ Error'}
                                </h3>
                                <pre className="mt-2 text-sm overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="mt-8 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Links:</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href="/dashboard"
                                    className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <h3 className="font-medium text-blue-900">Dashboard</h3>
                                    <p className="text-sm text-blue-700">Main dashboard</p>
                                </a>
                                <a
                                    href="/join-simple/test-business-id"
                                    className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <h3 className="font-medium text-green-900">Simple Join</h3>
                                    <p className="text-sm text-green-700">Test customer registration</p>
                                </a>
                                <a
                                    href="/login"
                                    className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <h3 className="font-medium text-purple-900">Login</h3>
                                    <p className="text-sm text-purple-700">Business login</p>
                                </a>
                                <a
                                    href="/signup"
                                    className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                                >
                                    <h3 className="font-medium text-orange-900">Signup</h3>
                                    <p className="text-sm text-orange-700">Create business account</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}