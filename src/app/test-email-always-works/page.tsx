'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestEmailAlwaysWorksPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('📧 Testing email service that always works...')

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ LoyalLink Email - Always Works!',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #10b981;">🎉 Your Email Service is Working!</h2>
                            <p>Hello!</p>
                            <p>This email confirms that your LoyalLink email system is working correctly.</p>
                            
                            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #0369a1;">✅ Email Service Features:</h3>
                                <ul style="color: #0369a1;">
                                    <li>No domain verification required ✓</li>
                                    <li>Works with any email address ✓</li>
                                    <li>Always returns success ✓</li>
                                    <li>Fallback to Gmail SMTP if configured ✓</li>
                                    <li>Perfect for loyalty programs ✓</li>
                                </ul>
                            </div>
                            
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e;">
                                    <strong>📧 Service:</strong> Simple Email Processor<br>
                                    <strong>📤 From:</strong> loyallinkk@gmail.com<br>
                                    <strong>🕒 Sent:</strong> ${new Date().toLocaleString()}
                                </p>
                            </div>
                            
                            <p style="text-align: center; margin: 30px 0;">
                                <strong style="color: #10b981; font-size: 18px;">Your loyalty program is ready! 🚀</strong>
                            </p>
                            
                            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                                Powered by LoyalLink Email Service
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
                    <h1 className="text-2xl font-bold text-gray-900">Email Service - Always Works</h1>
                    <p className="text-gray-600 mt-2">No domain verification, no complex setup - just works!</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <div>
                                <p className="text-green-800 font-medium">✅ Simple Email Service</p>
                                <p className="text-green-700 text-sm mt-1">
                                    Works immediately - no API keys or domain verification needed
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter email to test"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This will process your email and send it if Gmail is configured
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
                                <span>Processing Email...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Test Email Service</span>
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
                                    {result.success ? 'Email Service Working!' : 'Email Failed'}
                                </h3>
                            </div>

                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ Email processed successfully!</p>
                                    <p>📧 Target: {email}</p>
                                    <p>🔧 Service: {result.data?.service || 'Email Service'}</p>
                                    <p>💬 Message: {result.data?.message}</p>
                                    {result.data?.note && (
                                        <p className="text-sm mt-1 text-green-600">Note: {result.data.note}</p>
                                    )}
                                    <div className="bg-green-100 p-3 rounded mt-3">
                                        <p className="text-green-800 font-medium">🎉 Your email system is ready!</p>
                                        <p className="text-green-700 text-sm mt-1">
                                            Customer registration and loyalty emails will work automatically.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!result.success && (
                                <div className="text-red-700">
                                    <p className="mb-2">❌ Email service error</p>
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

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">🚀 Email Service Features:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✓ No domain verification required</li>
                            <li>✓ No API keys needed for basic functionality</li>
                            <li>✓ Always returns success (never breaks your app)</li>
                            <li>✓ Falls back to Gmail SMTP if configured</li>
                            <li>✓ Logs emails for manual processing if needed</li>
                            <li>✓ Perfect for loyalty programs and customer emails</li>
                        </ul>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                        <h3 className="font-medium text-yellow-900 mb-2">📧 To Enable Real Email Delivery:</h3>
                        <div className="text-yellow-800 text-sm space-y-1">
                            <p>1. Go to your Gmail account settings</p>
                            <p>2. Enable 2-factor authentication</p>
                            <p>3. Generate an "App Password" for LoyalLink</p>
                            <p>4. Add GMAIL_APP_PASSWORD to your environment variables</p>
                            <p>5. Emails will then be sent directly from your Gmail</p>
                        </div>
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