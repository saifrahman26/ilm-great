'use client'

import { useState } from 'react'

export default function TestBrevo() {
    const [email, setEmail] = useState('')
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const testBrevoEmail = async () => {
        if (!email) {
            setResult('❌ Please enter an email address')
            return
        }

        setLoading(true)
        setResult('🔄 Sending test email...')

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    subject: 'Brevo Test Email - LoyalLink',
                    message: `
                        <h2>🎉 Brevo Email Test Successful!</h2>
                        <p>Hello! This is a test email from your LoyalLink application.</p>
                        <p><strong>✅ Your Brevo integration is working perfectly!</strong></p>
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0369a1;">What this means:</h3>
                            <ul style="color: #0c4a6e;">
                                <li>Your Brevo API key is configured correctly</li>
                                <li>Email sending is working</li>
                                <li>Customer QR code emails will work</li>
                                <li>Password reset emails will work</li>
                            </ul>
                        </div>
                        <p>You can now use all email features in your loyalty program!</p>
                        <p style="color: #666; font-size: 14px;">
                            Sent from LoyalLink using Brevo API<br>
                            Time: ${new Date().toLocaleString()}
                        </p>
                    `,
                    customerName: 'Test User',
                    template: 'raw-html'
                })
            })

            const data = await response.json()

            if (response.ok) {
                setResult(`
✅ SUCCESS! Test email sent successfully!

📧 Email sent to: ${email}
📊 Response: ${JSON.stringify(data, null, 2)}

🎯 Next steps:
1. Check your email inbox (including spam folder)
2. Your Brevo integration is working!
3. Customer registration emails will now work
4. QR code emails will be sent automatically
                `)
            } else {
                setResult(`
❌ FAILED to send email

📧 Target email: ${email}
🚨 Error: ${data.error || 'Unknown error'}
📊 Details: ${JSON.stringify(data, null, 2)}

🔧 Troubleshooting:
1. Check your Brevo API key is correct
2. Verify the email address format
3. Check Brevo dashboard for sending limits
                `)
            }
        } catch (error) {
            setResult(`
❌ REQUEST FAILED

🚨 Error: ${error instanceof Error ? error.message : 'Unknown error'}

🔧 This might be due to:
1. Network connection issues
2. API endpoint problems
3. Invalid email format
            `)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🧪 Brevo Email Test
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Test your Brevo email integration to make sure everything is working correctly.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h2 className="text-lg font-semibold text-blue-900 mb-3">
                            📋 Current Configuration
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>API Key:</strong> {process.env.BREVO_API_KEY ? '✅ Configured' : '❌ Missing'}</p>
                            <p><strong>Sender Email:</strong> noreply@loyallink.com</p>
                            <p><strong>Service:</strong> Brevo (formerly Sendinblue)</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📧 Test Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address to receive test email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Enter any valid email address - you'll receive a test email there
                            </p>
                        </div>

                        <button
                            onClick={testBrevoEmail}
                            disabled={loading || !email}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? '📤 Sending Test Email...' : '🚀 Send Test Email'}
                        </button>
                    </div>

                    {result && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Test Results</h3>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto">
                                {result}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                            💡 What This Test Does
                        </h3>
                        <ul className="text-yellow-800 space-y-2">
                            <li>• Verifies your Brevo API key is working</li>
                            <li>• Tests the email sending functionality</li>
                            <li>• Confirms your email templates are rendering correctly</li>
                            <li>• Validates the sender email configuration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}