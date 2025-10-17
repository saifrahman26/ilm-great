'use client'

import { useState } from 'react'

export default function TestEmailPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestEmail = async () => {
        if (!email) {
            alert('Please enter an email address')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '🧪 Test Email from LoyalLink',
                    message: `
                        <h2>✅ Email Test Successful!</h2>
                        <p>If you're reading this, your Resend email integration is working perfectly!</p>
                        <p><strong>Sent to:</strong> ${email}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <hr>
                        <p style="color: #666; font-size: 14px;">
                            Powered by <strong>🔗 LoyalLink</strong> using Resend API
                        </p>
                    `,
                    template: 'raw-html'
                })
            })

            const data = await response.json()
            setResult(data)

            if (data.success) {
                alert('✅ Email sent successfully! Check your inbox.')
            } else {
                alert('❌ Email failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Test email error:', error)
            setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
            alert('❌ Error sending email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Test</h1>
                    <p className="text-gray-600 mb-8">Test if Resend email integration is working</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={sendTestEmail}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '📤 Sending...' : '🚀 Send Test Email'}
                        </button>
                    </div>

                    {result && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-3">
                                {result.success ? '✅ Success' : '❌ Error'}
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">📋 What to check:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✓ Email arrives in your inbox</li>
                            <li>✓ Sender shows as "LoyalLink &lt;onboarding@resend.dev&gt;"</li>
                            <li>✓ Subject line is correct</li>
                            <li>✓ HTML formatting looks good</li>
                            <li>✓ Check spam folder if not in inbox</li>
                        </ul>
                    </div>

                    <div className="mt-6 text-center">
                        <a
                            href="/dashboard"
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            ← Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
