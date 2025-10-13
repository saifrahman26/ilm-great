'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react'

export default function TestEmailPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const sendTestEmail = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
                setResult(data)
            } else {
                setError(data.error || 'Failed to send test email')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Email Test</h1>
                    <p className="text-gray-600 mt-2">Test your email configuration</p>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter email to test"
                        />
                    </div>

                    <button
                        onClick={sendTestEmail}
                        disabled={loading || !email}
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Send Test Email</span>
                            </>
                        )}
                    </button>

                    {result && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-green-800 font-medium">Success!</span>
                            </div>
                            <p className="text-green-700 mt-2">{result.message}</p>
                            {result.result?.id && (
                                <p className="text-green-600 text-sm mt-1">Email ID: {result.result.id}</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex items-center space-x-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-red-800 font-medium">Error</span>
                            </div>
                            <p className="text-red-700 mt-2">{error}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-blue-800 font-medium mb-2">Email Configuration Check:</h3>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Using Resend API for email delivery</li>
                            <li>• From: onboarding@resend.dev (Resend test domain)</li>
                            <li>• API Key: {process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}