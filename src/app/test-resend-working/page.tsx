'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestResendWorkingPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('📧 Testing Resend email service...')

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ LoyalLink - Resend Email Test Working!',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                            <div style="background: white; padding: 30px; border-radius: 8px;">
                                <h2 style="color: #10b981; text-align: center;">🎉 Resend Email Service Working!</h2>
                                <p>Hello!</p>
                                <p>This email confirms that your LoyalLink email service is now working with Resend!</p>
                                
                                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                                    <h3 style="color: #0369a1; margin: 0 0 10px 0;">✅ Resend Features:</h3>
                                    <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
                                        <li>No domain verification required ✓</li>
                                        <li>Uses onboarding@resend.dev ✓</li>
                                        <li>Delivers to real inboxes ✓</li>
                                        <li>Works immediately ✓</li>
                                        <li>Perfect for loyalty programs ✓</li>
                                    </ul>
                                </div>
                                
                                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #92400e;">
                                        <strong>📧 Email Service:</strong> Resend API<br>
                                        <strong>📤 From:</strong> onboarding@resend.dev<br>
                                        <strong>🕒 Sent:</strong> ${new Date().toLocaleString()}
                                    </p>
                                </div>
                                
                                <p style="text-align: center; margin: 30px 0;">
                                    <strong style="color: #10b981; font-size: 18px;">Your customers will now receive emails! 🚀</strong>
                                </p>
                                
                                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                                    Powered by LoyalLink + Resend
                                </p>
                            </div>
                        </div>
                    `,
                    customerName: 'Test User',
                    template: 'raw-html'
                })
            })

            const data = await response.json()

            console.log('📥 Resend response:', data)

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
                    <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Resend Email Service Test</h1>
                    <p className="text-gray-600 mt-2">Like Resend - no domain verification needed!</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                                <p className="text-blue-800 font-medium">✅ Resend API with Onboarding Domain</p>
                                <p className="text-blue-700 text-sm mt-1">
                                    From: onboarding@resend.dev - works immediately!
                                </p>
                            </div>
                        </div>
                    </div>

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
                            This will send a real email to your inbox using Resend
                        </p>
                    </div>

                    <button
                        onClick={sendTestEmail}
                        disabled={loading || !email}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending via Resend...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Send Resend Test Email</span>
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
                                    {result.success ? 'Email Sent via Resend!' : 'Email Failed'}
                                </h3>
                            </div>

                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ Email sent successfully via Resend!</p>
                                    <p>📧 Check your inbox: {email}</p>
                                    <p>🔧 Service: {result.data?.service || 'Resend'}</p>
                                    {result.data?.emailId && (
                                        <p className="text-sm mt-1">Email ID: {result.data.emailId}</p>
                                    )}
                                    <div className="bg-green-100 p-3 rounded mt-3">
                                        <p className="text-green-800 font-medium">🎉 Resend email service is working!</p>
                                        <p className="text-green-700 text-sm mt-1">
                                            Your customers will now receive emails in their inbox, not spam folder.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!result.success && (
                                <div className="text-red-700">
                                    <p className="mb-2">❌ Failed to send email via Resend</p>
                                    <div className="bg-red-100 p-3 rounded text-sm">
                                        <strong>Status:</strong> {result.status}<br />
                                        <strong>Error:</strong> {result.data?.error || result.error}<br />
                                        {result.data?.details && (
                                            <>
                                                <strong>Details:</strong><br />
                                                <pre className="mt-1 overflow-auto whitespace-pre-wrap">
                                                    {typeof result.data.details === 'string' ? result.data.details : JSON.stringify(result.data.details, null, 2)}
                                                </pre>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
                        <h3 className="font-medium text-green-900 mb-2">🚀 Resend Email Service Benefits:</h3>
                        <ul className="text-green-800 text-sm space-y-1">
                            <li>✓ No domain verification required</li>
                            <li>✓ Uses onboarding@resend.dev (works immediately)</li>
                            <li>✓ Delivers to inbox, not spam</li>
                            <li>✓ High delivery rates</li>
                            <li>✓ Perfect for transactional emails</li>
                            <li>✓ Works with any recipient email address</li>
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
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded text-center hover:bg-purple-700"
                        >
                            Test Registration
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}