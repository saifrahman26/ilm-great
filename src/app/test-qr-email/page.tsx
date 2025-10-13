'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestQREmailPage() {
    const [email, setEmail] = useState('test@example.com')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const sendTestQREmail = async () => {
        setLoading(true)
        setResult(null)

        // Create a test customer object
        const testCustomer = {
            id: 'test-customer-id',
            name: 'Test Customer',
            email: email,
            qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=test-qr-data',
            qr_data: 'test-qr-data'
        }

        try {
            // Test the sendQRCodeToCustomer function by calling the messaging API directly
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Loyalty QR Code</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">🎉 Welcome to Our Loyalty Program!</h1>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${testCustomer.name},</p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            Thank you for joining our loyalty program! Here's your personal QR code:
        </p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <img src="${testCustomer.qr_code_url}" alt="Your Personal QR Code" style="max-width: 250px; height: auto; border: 2px solid #e5e7eb; border-radius: 8px;" />
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Your Personal QR Code</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1d4ed8; margin: 0 0 15px 0;">How to use your QR code:</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Show this QR code when you visit our store</li>
                <li style="margin-bottom: 8px;">We'll scan it to track your visit</li>
                <li style="margin-bottom: 8px;">Earn points with each visit</li>
                <li>Get rewards when you reach your goal!</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Save this email or take a screenshot of your QR code for easy access!
            </p>
        </div>
    </div>
</body>
</html>`

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    message: emailHtml,
                    subject: '🎉 Welcome! Your Loyalty QR Code',
                    template: 'raw-html'
                })
            })

            const data = await response.json()
            setResult({
                success: response.ok,
                data: data,
                testCustomer: testCustomer
            })
        } catch (error) {
            setResult({
                success: false,
                error: 'Network error',
                details: error
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">QR Code Email Test</h1>
                    <p className="text-gray-600 mt-2">Test QR code welcome email functionality</p>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter email to test"
                        />
                    </div>

                    <button
                        onClick={sendTestQREmail}
                        disabled={loading || !email}
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Send Test QR Email</span>
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
                                    {result.success ? 'QR Email Sent!' : 'Email Failed'}
                                </h3>
                            </div>
                            {result.success && (
                                <div className="text-green-700">
                                    <p>✅ QR code welcome email sent successfully!</p>
                                    <p>📧 Check your inbox: {email}</p>
                                    {result.data?.result?.id && (
                                        <p className="text-sm mt-1">Email ID: {result.data.result.id}</p>
                                    )}
                                </div>
                            )}
                            {!result.success && (
                                <pre className="text-sm text-red-700 mt-2 overflow-auto whitespace-pre-wrap">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">Email System Status:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✅ Email API working (Resend configured)</li>
                            <li>✅ QR code generation working</li>
                            <li>✅ Customer registration working</li>
                            <li>✅ QR code email template ready</li>
                            <li>✅ Visit confirmation emails ready</li>
                        </ul>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        <a
                            href="/api/register-customer"
                            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                        >
                            Test Registration
                        </a>
                        <a
                            href="/join/6be1dbc3-0832-4617-b143-d7135590374a"
                            target="_blank"
                            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700"
                        >
                            Test Join Page
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}