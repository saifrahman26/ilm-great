'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestEmailWorkingPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('📧 Testing working email service...')

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ LoyalLink Email Test - Working!',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #10b981;">✅ Email Service is Working!</h2>
                            <p>Hi there!</p>
                            <p>This email confirms that your LoyalLink email service is now working correctly.</p>
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #0369a1;">
                                    🎉 <strong>Success!</strong> Your customers will now receive:
                                </p>
                                <ul style="color: #0369a1; margin: 10px 0;">
                                    <li>Welcome emails with QR codes</li>
                                    <li>Visit confirmation emails</li>
                                    <li>Reward notifications</li>
                                </ul>
                            </div>
                            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                            <p style="color: #6b7280; font-size: 14px;">
                                Sent via LoyalLink Email Service
                            </p>
                        </div>
                    `,
                    customerName: 'Test User',
                    template: 'raw-html'
                })
            })

            const data = await response.json()

            console.log('📥 Email response:', data)

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
                    <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Email Service Test - Fixed Version</h1>
                    <p className="text-gray-600 mt-2">Test the working email service (Resend + Brevo fallback)</p>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter email to test"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This will send a test email using the working email service
                        </p>
                    </div>

                    <button
                        onClick={sendTestEmail}
                        disabled={loading || !email}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending Test Email...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Send Working Email Test</span>
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
                                    {result.success ? 'Email Sent Successfully!' : 'Email Failed'}
                                </h3>
                            </div>

                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ Test email sent successfully!</p>
                                    <p>📧 Check your inbox: {email}</p>
                                    <p>🔧 Service used: {result.data?.service || 'Unknown'}</p>
                                    {result.data?.result?.id && (
                                        <p className="text-sm mt-1">Email ID: {result.data.result.id}</p>
                                    )}
                                    <div className="bg-green-100 p-3 rounded mt-3">
                                        <p className="text-green-800 font-medium">🎉 Your email service is now working!</p>
                                        <p className="text-green-700 text-sm mt-1">
                                            Customer registration and QR code emails will be delivered successfully.
                                        </p>
                                    </div>
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

                    <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
                        <h3 className="font-medium text-green-900 mb-2">✅ Fixed Email Service Features:</h3>
                        <ul className="text-green-800 text-sm space-y-1">
                            <li>✓ Uses Resend with onboarding domain (no verification needed)</li>
                            <li>✓ Automatic fallback to Brevo if Resend fails</li>
                            <li>✓ Works immediately without domain setup</li>
                            <li>✓ Delivers emails to real inboxes</li>
                            <li>✓ Supports HTML and text formats</li>
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
                            href="/customer-register/6be1dbc3-0832-4617-b143-d7135590374a"
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
                        >
                            Test Registration
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}