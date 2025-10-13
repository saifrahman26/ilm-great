'use client'

import { useState } from 'react'

export default function TestEmailProduction() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const testEmail = async () => {
        if (!email) {
            alert('Please enter an email address')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    subject: '🧪 LoyalLink Production Email Test',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #4f46e5;">🎉 Email Test Successful!</h2>
                            <p>This is a test email from your deployed LoyalLink application.</p>
                            <p><strong>Sent from:</strong> ${window.location.origin}</p>
                            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #059669; margin: 0 0 10px 0;">✅ Production Email Working!</h3>
                                <p style="margin: 0; color: #065f46;">Your LoyalLink application can successfully send emails in production.</p>
                            </div>
                            <p>Best regards,<br><strong>🔗 LoyalLink Team</strong></p>
                        </div>
                    `,
                    template: 'raw-html'
                })
            })

            const data = await response.json()
            setResult({
                success: response.ok,
                status: response.status,
                data: data
            })

        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        🧪 Production Email Test
                    </h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Email Address:
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={testEmail}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Test Email...' : 'Send Test Email'}
                        </button>
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Success!' : '❌ Error'}
                            </h3>
                            <pre className="mt-2 text-sm overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">📋 Current Configuration:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• <strong>Domain:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</li>
                            <li>• <strong>Email Service:</strong> Resend API</li>
                            <li>• <strong>From Address:</strong> LoyalLink &lt;onboarding@resend.dev&gt;</li>
                            <li>• <strong>Environment:</strong> Production</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}