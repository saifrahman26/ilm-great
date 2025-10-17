'use client'

import { useState } from 'react'

export default function EmailTestGmailPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const testGmailEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/send-email-gmail-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ Gmail SMTP Test - LoyalLink Working!',
                    message: `
                        <h2>🎉 Gmail SMTP Email Test Successful!</h2>
                        <p>Hello!</p>
                        <p>This email was sent directly from <strong>loyallinkk@gmail.com</strong> using Gmail SMTP.</p>
                        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3>✅ What this proves:</h3>
                            <ul>
                                <li>Gmail SMTP is working ✓</li>
                                <li>App password is configured ✓</li>
                                <li>Emails are delivered to real inboxes ✓</li>
                                <li>Your loyalty program emails will work ✓</li>
                            </ul>
                        </div>
                        <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
                        <p>From: LoyalLink Gmail SMTP Service</p>
                    `,
                    customerName: 'Gmail Test User'
                })
            })

            const data = await response.json()
            setResult({ success: response.ok, data })
        } catch (error) {
            setResult({ success: false, error: 'Network error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📧</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Gmail SMTP Email Test</h1>
                    <p className="text-gray-600 mt-2">Test your Gmail SMTP configuration</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-900 mb-2">📧 Gmail Configuration:</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>✓ Gmail Account: loyallinkk@gmail.com</li>
                        <li>✓ App Password: jeoy gdhp idsl mzzd</li>
                        <li>✓ Service: Gmail SMTP</li>
                        <li>✓ Daily Limit: ~500 emails</li>
                    </ul>
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
                            placeholder="Enter email to test Gmail SMTP"
                        />
                    </div>

                    <button
                        onClick={testGmailEmail}
                        disabled={loading || !email}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending via Gmail SMTP...</span>
                            </>
                        ) : (
                            <>
                                <span>📧</span>
                                <span>Send Gmail SMTP Test</span>
                            </>
                        )}
                    </button>

                    {result && (
                        <div className={`p-4 rounded-md border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center mb-2">
                                <span className="text-lg mr-2">{result.success ? '✅' : '❌'}</span>
                                <h3 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                    {result.success ? 'Gmail SMTP Working!' : 'Gmail SMTP Failed'}
                                </h3>
                            </div>

                            {result.success && (
                                <div className="text-green-700">
                                    <p className="font-medium">Email sent successfully via Gmail SMTP!</p>
                                    <p className="text-sm mt-1">📧 Check your inbox: {email}</p>
                                    <p className="text-sm">🔧 Service: {result.data?.service || 'Gmail SMTP'}</p>
                                    {result.data?.messageId && (
                                        <p className="text-xs mt-1 text-green-600">Message ID: {result.data.messageId}</p>
                                    )}
                                    <div className="bg-green-100 p-3 rounded mt-3">
                                        <p className="text-green-800 font-medium">🎉 Your Gmail SMTP is working perfectly!</p>
                                        <p className="text-green-700 text-sm mt-1">
                                            Customer registration and loyalty emails will be delivered from loyallinkk@gmail.com
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!result.success && (
                                <div className="text-red-700">
                                    <p className="font-medium mb-2">Failed to send via Gmail SMTP</p>
                                    <div className="bg-red-100 p-3 rounded text-sm">
                                        <strong>Error:</strong> {result.data?.error || result.error}<br />
                                        {result.data?.details && (
                                            <>
                                                <strong>Details:</strong> {result.data.details}<br />
                                            </>
                                        )}
                                        <strong>Note:</strong> Make sure Gmail app password is added to Vercel environment variables
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                    <h3 className="font-medium text-yellow-900 mb-2">🔧 For Production (Vercel):</h3>
                    <div className="text-yellow-800 text-sm space-y-1">
                        <p>1. Go to Vercel Dashboard → Settings → Environment Variables</p>
                        <p>2. Add: <code className="bg-yellow-100 px-1 rounded">GMAIL_USER=loyallinkk@gmail.com</code></p>
                        <p>3. Add: <code className="bg-yellow-100 px-1 rounded">GMAIL_APP_PASSWORD=jeoy gdhp idsl mzzd</code></p>
                        <p>4. Redeploy your application</p>
                        <p>5. Test again on production</p>
                    </div>
                </div>

                <div className="mt-4 flex space-x-3">
                    <a
                        href="/dashboard"
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700"
                    >
                        Back to Dashboard
                    </a>
                    <a
                        href="/test-qr-email"
                        className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                    >
                        Test QR Email
                    </a>
                </div>
            </div>
        </div>
    )
}