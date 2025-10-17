'use client'

import { useState } from 'react'

export default function EmailTestPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const testEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ LoyalLink Email Test - Resend Service',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #10b981;">🎉 Email Service Working!</h2>
                            <p>This email was sent via Resend API - the most cost-effective solution for transactional emails.</p>
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3>✅ Service Features:</h3>
                                <ul>
                                    <li>3,000 free emails/month</li>
                                    <li>$20/month for 50k emails</li>
                                    <li>High deliverability rates</li>
                                    <li>Gmail fallback included</li>
                                </ul>
                            </div>
                            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                    `,
                    customerName: 'Test User',
                    template: 'raw-html'
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
            <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">📧 Email Service Test</h1>
                <p className="text-gray-600 mb-4">Test Resend + Gmail fallback</p>

                <div className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Enter email"
                    />

                    <button
                        onClick={testEmail}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Test Email'}
                    </button>

                    {result && (
                        <div className={`p-4 rounded ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="font-medium">{result.success ? '✅ Success!' : '❌ Failed'}</p>
                            <p className="text-sm mt-1">{result.data?.message || result.error}</p>
                            {result.data?.service && (
                                <p className="text-xs mt-1">Service: {result.data.service}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded">
                    <h3 className="font-medium text-blue-900 mb-2">📊 Cost Comparison:</h3>
                    <div className="text-blue-800 text-sm space-y-1">
                        <p><strong>Resend:</strong> 3k free, then $20/50k emails</p>
                        <p><strong>Gmail:</strong> ~500/day free backup</p>
                        <p><strong>Best:</strong> Resend primary + Gmail fallback</p>
                    </div>
                </div>
            </div>
        </div>
    )
}