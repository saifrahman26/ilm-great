'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle, Settings } from 'lucide-react'

export default function TestBrevoSimplePage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const testBrevoAPI = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('🧪 Testing Brevo API directly...')

            const response = await fetch('/api/test-brevo-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            console.log('📥 Response:', data)

            setResult({
                success: response.ok,
                status: response.status,
                data: data
            })
        } catch (error) {
            console.error('💥 Network error:', error)
            setResult({
                success: false,
                error: 'Network error',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <Settings className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Brevo API Direct Test</h1>
                    <p className="text-gray-600 mt-2">Test Brevo email API directly to diagnose issues</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Test Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email to test"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This will send a simple test email to verify Brevo API configuration
                        </p>
                    </div>

                    <button
                        onClick={testBrevoAPI}
                        disabled={loading || !email}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Testing Brevo API...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Test Brevo API</span>
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
                                    {result.success ? 'Brevo API Working!' : 'Brevo API Error'}
                                </h3>
                            </div>

                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ Test email sent successfully via Brevo API!</p>
                                    <p>📧 Check your inbox: {email}</p>
                                    {result.data?.emailId && (
                                        <p className="text-sm mt-1">Email ID: {result.data.emailId}</p>
                                    )}
                                </div>
                            )}

                            {!result.success && (
                                <div className="text-red-700">
                                    <p className="mb-2">❌ Failed to send email</p>
                                    <div className="bg-red-100 p-3 rounded text-sm">
                                        <strong>Status:</strong> {result.status}<br />
                                        <strong>Error:</strong> {result.data?.error || result.error}<br />
                                        {result.data?.details && (
                                            <>
                                                <strong>Details:</strong><br />
                                                <pre className="mt-1 overflow-auto whitespace-pre-wrap">
                                                    {JSON.stringify(result.data.details, null, 2)}
                                                </pre>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">🔍 What this test checks:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✓ Brevo API key configuration</li>
                            <li>✓ Sender email configuration</li>
                            <li>✓ API connectivity and authentication</li>
                            <li>✓ Basic email sending functionality</li>
                            <li>✓ Response handling and error reporting</li>
                        </ul>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        <a
                            href="/test-qr-email"
                            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                        >
                            Test QR Email
                        </a>
                        <a
                            href="/test-brevo"
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded text-center hover:bg-purple-700"
                        >
                            Full Brevo Test
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}