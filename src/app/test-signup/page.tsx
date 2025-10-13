'use client'

import { useState } from 'react'
import { User, Building, AlertCircle, CheckCircle } from 'lucide-react'

export default function TestSignupPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testSignup = async () => {
        setLoading(true)
        setResult(null)

        const testData = {
            email: `test${Date.now()}@example.com`,
            password: 'testpassword123',
            confirmPassword: 'testpassword123',
            businessName: 'Test Coffee Shop',
            businessEmail: 'business@testcoffee.com',
            phone: '+1234567890'
        }

        // Generate a valid UUID for testing
        const generateUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0
                const v = c == 'x' ? r : (r & 0x3 | 0x8)
                return v.toString(16)
            })
        }

        try {
            // Test the create-business API directly with a valid UUID
            const testUserId = generateUUID()
            const response = await fetch('/api/create-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: testUserId,
                    businessData: {
                        name: testData.businessName,
                        email: testData.businessEmail,
                        phone: testData.phone,
                        reward_title: 'Free Coffee',
                        reward_description: 'Get a free coffee on us!',
                        visit_goal: 5
                    }
                })
            })

            const data = await response.json()
            setResult({
                success: response.ok,
                data: data,
                testData: testData
            })
        } catch (error) {
            setResult({
                success: false,
                error: 'Network error',
                details: error
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <Building className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Signup System Test</h1>
                    <p className="text-gray-600 mt-2">Test business creation functionality</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={testSignup}
                        disabled={loading}
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Testing...</span>
                            </>
                        ) : (
                            <>
                                <User className="w-4 h-4" />
                                <span>Test Business Creation</span>
                            </>
                        )}
                    </button>

                    {result && (
                        <div className={`mt-6 p-4 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center mb-2">
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                )}
                                <h3 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                    {result.success ? 'Success!' : 'Error'}
                                </h3>
                            </div>
                            <pre className="text-sm overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">Signup Issues Diagnosis:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✅ Enhanced AuthContext with better session handling</li>
                            <li>✅ Created /api/create-business with service role</li>
                            <li>✅ Added retry logic for session establishment</li>
                            <li>✅ Improved error messages and logging</li>
                            <li>✅ Fallback mechanisms for business creation</li>
                        </ul>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        <a
                            href="/signup"
                            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                        >
                            Try Real Signup
                        </a>
                        <a
                            href="/api/health"
                            target="_blank"
                            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700"
                        >
                            Check API Health
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}