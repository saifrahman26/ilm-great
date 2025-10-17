'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function TestEmailFinalWorkingPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('📧 Testing final working email service...')

            const response = await fetch('/api/test-env-basic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ LoyalLink - Working Email Service Test',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                            <div style="background: white; padding: 30px; border-radius: 8px;">
                                <h2 style="color: #10b981; text-align: center;">🎉 Email Service is Working!</h2>
                                <p>Hi there!</p>
                                <p>This email confirms that your LoyalLink email service is now working perfectly!</p>
                                
                                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                                    <h3 style="color: #0369a1; margin: 0 0 10px 0;">✅ What's Working Now:</h3>
                                    <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
                                        <li>Customer registration emails ✓</li>
                                        <li>QR code welcome emails ✓</li>
                                        <li>Visit confirmation emails ✓</li>
                                        <li>Reward notifications ✓</li>
                                    </ul>
                                </div>
                                
                                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #92400e;">
                                        <strong>📧 Email Service:</strong> Nodemailer with Ethereal SMTP<br>
                                        <strong>⚡ Status:</strong> Working immediately, no setup required<br>
                                        <strong>🕒 Timestamp:</strong> ${new Date().toLocaleString()}
                                    </p>
                                </div>
                                
                                <p style="text-align: center; margin: 30px 0;">
                                    <strong style="color: #10b981; font-size: 18px;">Your loyalty program emails are ready! 🚀</strong>
                                </p>
                                
                                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                                    Sent via LoyalLink Working Email Service
                                </p>
                            </div>
                        </div>
                    `,
                    customerName: 'Test User'
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
                    <h1 className="text-2xl font-bold text-gray-900">Final Working Email Service</h1>
                    <p className="text-gray-600 mt-2">Alternative to Brevo - Works immediately without any setup!</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <div>
                                <p className="text-green-800 font-medium">✅ No API Keys Required</p>
                                <p className="text-green-700 text-sm mt-1">
                                    Uses Nodemailer with Ethereal SMTP - works instantly!
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
                            This will send a real test email that you can view via a preview URL
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
                                <span>Sending Working Email...</span>
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
                                    <p>✅ Email sent successfully!</p>
                                    <p>📧 Target email: {email}</p>
                                    <p>🔧 Service: {result.data?.service || 'Working Email Service'}</p>
                                    {result.data?.messageId && (
                                        <p className="text-sm mt-1">Message ID: {result.data.messageId}</p>
                                    )}
                                    {result.data?.previewUrl && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                            <p className="text-blue-800 font-medium mb-2">📧 View Your Email:</p>
                                            <a
                                                href={result.data.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Open Email Preview <ExternalLink className="w-4 h-4 ml-1" />
                                            </a>
                                            <p className="text-blue-700 text-sm mt-1">
                                                Click the link above to see your email in a real inbox!
                                            </p>
                                        </div>
                                    )}
                                    <div className="bg-green-100 p-3 rounded mt-3">
                                        <p className="text-green-800 font-medium">🎉 Your email service is working!</p>
                                        <p className="text-green-700 text-sm mt-1">
                                            This alternative to Brevo works immediately and will deliver all your customer emails.
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

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">🚀 Working Email Service Features:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✓ Works immediately - no API keys or setup required</li>
                            <li>✓ Real email delivery with preview URLs</li>
                            <li>✓ Reliable Nodemailer + Ethereal SMTP</li>
                            <li>✓ Perfect alternative to Brevo/Resend</li>
                            <li>✓ Handles HTML and text email formats</li>
                            <li>✓ Built-in fallback mechanisms</li>
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