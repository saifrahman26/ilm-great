'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestEmailDebug() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [testType, setTestType] = useState('basic')
    const [customerName, setCustomerName] = useState('John Doe')
    const [businessName, setBusinessName] = useState('Test Coffee Shop')
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testEmail = async () => {
        setLoading(true)
        setResults(null)

        try {
            const response = await fetch('/api/test-email-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    testType,
                    customerName,
                    businessName
                })
            })

            const data = await response.json()
            setResults(data)
        } catch (error) {
            setResults({
                success: false,
                error: 'Failed to test email sending',
                details: error
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Email Debug Console</h1>
                    </div>
                    <p className="text-gray-600">Test email functionality and debug issues</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Test Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="test@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Type
                            </label>
                            <select
                                value={testType}
                                onChange={(e) => setTestType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="basic">Basic Email Test</option>
                                <option value="ai-enhanced">AI-Enhanced Email Test</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Name
                            </label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <button
                            onClick={testEmail}
                            disabled={loading || !email}
                            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Sending Test Email...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Test Email
                                </>
                            )}
                        </button>

                        <button
                            onClick={async () => {
                                setLoading(true)
                                try {
                                    const response = await fetch('/api/test-resend-simple', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ to: email })
                                    })
                                    const data = await response.json()
                                    setResults({ ...data, testType: 'Direct Resend Test' })
                                } catch (error) {
                                    setResults({
                                        success: false,
                                        error: 'Failed to test direct Resend',
                                        testType: 'Direct Resend Test'
                                    })
                                } finally {
                                    setLoading(false)
                                }
                            }}
                            disabled={loading || !email}
                            className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Direct Resend Test
                        </button>
                    </div>
                </div>

                {results && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            {results.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <h3 className="text-lg font-semibold">Email Test Results</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${results.success
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {results.success ? 'Success' : 'Failed'}
                                </span>
                            </div>

                            {results.message && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                                    <div className={`border rounded-lg p-3 ${results.success
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                        }`}>
                                        <p className={`text-sm ${results.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {results.message}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {results.error && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Error Details</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-800 text-sm">{results.error}</p>
                                    </div>
                                </div>
                            )}

                            {results.environment && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Environment Check</h4>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Resend API Key:</span>
                                                <span className={`ml-2 ${results.environment.hasResendKey ? 'text-green-600' : 'text-red-600'}`}>
                                                    {results.environment.hasResendKey ? '✅ Present' : '❌ Missing'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Key Length:</span>
                                                <span className="ml-2 text-gray-600">
                                                    {results.environment.resendKeyLength} chars
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Verified Email:</span>
                                                <span className="ml-2 text-gray-600">
                                                    {results.environment.verifiedEmail || 'Not set'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Email Service:</span>
                                                <span className="ml-2 text-gray-600">
                                                    {results.environment.emailService || 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Full Response</h4>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                                    <pre className="text-xs text-gray-700">
                                        {JSON.stringify(results, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <a
                        href="/dashboard"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}