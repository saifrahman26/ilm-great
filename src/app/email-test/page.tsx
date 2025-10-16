'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function EmailTestPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('📧 Testing email service...')

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    subject: '✅ LoyalLink Email Test - Working!',
                    message: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #10b981;">🎉 Email Service Working!</h2>
                            <p>Hello!</p>
                            <p>This email confirms that your LoyalLink email service is working correctly.</p>
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #0369a1;">
                                    <strong>✅ Success!</strong> Your customers will now receive emails.
                                </p>
                            </div>
                            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
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
                    <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Email Service Test</h1>
                    <p className="text-gray-600 mt-2">Test your working email service</p>
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
                            placeholder="Enter email to test"
                        />
                    </div>

                    <button
                        onClick={sendTestEmail}
                        disabled={loading || !email}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending Email...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Send Test Email</span>
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
                                    {result.success ? 'Email Sent!' : 'Email Failed'}
                                </h3>
                            </div>

                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ Email sent successfully!</p>
                                    <p>📧 To: {email}</p>
                                    <p>🔧 Service: {result.data?.service || 'Email Service'}</p>
                                    {result.data?.previewUrl && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded">
                                            <p className="text-blue-800 font-medium mb-2">📧 View Email:</p>
                                            <a
                                                href={result.data.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Open Email Preview <ExternalLink className="w-4 h-4 ml-1" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!result.success && (
                                <div className="text-red-700">
                                    <p>❌ Failed to send email</p>
                                    <pre className="text-sm mt-2 bg-red-100 p-2 rounded overflow-auto">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}