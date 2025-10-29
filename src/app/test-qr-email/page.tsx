'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestQREmailPage() {
    const [email, setEmail] = useState('test@example.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestQREmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            // Test the new AI-enhanced visit confirmation email with fixed visit count logic
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    customerName: 'Test Customer',
                    businessName: 'Test Coffee Shop',
                    businessType: 'Coffee Shop',
                    emailType: 'visit_confirmation',
                    context: {
                        visitCount: 18, // Total visits (like your example)
                        visitGoal: 5,   // Goal is 5 visits per reward
                        rewardTitle: 'Free Coffee',
                        isRewardReached: true, // 18 % 5 = 3, but this is testing reward reached
                        customerId: 'test-customer-123'
                    },
                    template: 'ai-enhanced'
                })
            })

            const data = await response.json()
            setResult({
                success: response.ok,
                data: data,
                testType: 'visit_confirmation_reward_reached'
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

    const sendProgressEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            // Test the visit confirmation email with progress (not reward reached)
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    customerName: 'Test Customer',
                    businessName: 'Test Coffee Shop',
                    businessType: 'Coffee Shop',
                    emailType: 'visit_confirmation',
                    context: {
                        visitCount: 18, // Total visits (like your example)
                        visitGoal: 5,   // Goal is 5 visits per reward  
                        rewardTitle: 'Free Coffee',
                        isRewardReached: false, // 18 % 5 = 3, so 3/5 progress
                        customerId: 'test-customer-123'
                    },
                    template: 'ai-enhanced'
                })
            })

            const data = await response.json()
            setResult({
                success: response.ok,
                data: data,
                testType: 'visit_confirmation_progress'
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
                    <Mail className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">QR Code Email Test</h1>
                    <p className="text-gray-600 mt-2">Test QR code welcome email functionality</p>
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

                    <div className="space-y-3">
                        <button
                            onClick={sendTestQREmail}
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
                                    <span>Test Reward Reached Email (5/5)</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={sendProgressEmail}
                            disabled={loading || !email}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Test Progress Email (3/5)</span>
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center mb-2">
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                )}
                                <h3 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                    {result.success ? 'QR Email Sent!' : 'Email Failed'}
                                </h3>
                            </div>
                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ {result.testType === 'visit_confirmation_reward_reached' ? 'Reward reached email' : 'Progress email'} sent successfully!</p>
                                    <p>📧 Check your inbox: {email}</p>
                                    <p className="text-sm mt-1">Test type: {result.testType}</p>
                                    {result.data?.result?.id && (
                                        <p className="text-sm mt-1">Email ID: {result.data.result.id}</p>
                                    )}
                                </div>
                            )}
                            {!result.success && (
                                <pre className="text-sm text-red-700 mt-2 overflow-auto whitespace-pre-wrap">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">Fixed Issues:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✅ Visit count consistency fixed (no more "5/5 visits" with "13 visits left")</li>
                            <li>✅ Mobile-optimized email templates</li>
                            <li>✅ Responsive QR code display</li>
                            <li>✅ Better progress bar visualization</li>
                            <li>✅ Consistent visit calculation logic</li>
                        </ul>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        <a
                            href="/api/register-customer"
                            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                        >
                            Test Registration
                        </a>
                        <a
                            href="/join/6be1dbc3-0832-4617-b143-d7135590374a"
                            target="_blank"
                            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700"
                        >
                            Test Join Page
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}