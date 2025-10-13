'use client'

import { useState } from 'react'

export default function DebugEmailPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testDirectEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    message: 'This is a direct test email to debug the email functionality.',
                    subject: 'Direct Email Test',
                    template: 'simple'
                })
            })

            const data = await response.json()
            setResult({
                type: 'direct',
                success: response.ok,
                status: response.status,
                data
            })
        } catch (error) {
            setResult({
                type: 'direct',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const testRegistrationEmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/test-registration-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com'
                })
            })

            const data = await response.json()
            setResult({
                type: 'registration',
                success: response.ok,
                status: response.status,
                data
            })
        } catch (error) {
            setResult({
                type: 'registration',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const testResendDirect = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/test-resend-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })

            const data = await response.json()
            setResult({
                type: 'resend-direct',
                success: response.ok,
                status: response.status,
                data
            })
        } catch (error) {
            setResult({
                type: 'resend-direct',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const testFullRegistration = async () => {
        setLoading(true)
        setResult(null)

        try {
            // Test the full registration flow
            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: 'test-business-id',
                    name: 'Test Customer',
                    phone: '+1234567890',
                    email: 'test@example.com'
                })
            })

            const data = await response.json()
            setResult({
                type: 'full-registration',
                success: response.ok,
                status: response.status,
                data
            })
        } catch (error) {
            setResult({
                type: 'full-registration',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const testQREmail = async () => {
        setLoading(true)
        setResult(null)

        try {
            // Test the sendQRCodeToCustomer function
            const testCustomer = {
                id: 'test-id',
                name: 'Test Customer',
                email: 'test@example.com',
                qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=test-qr',
                qr_data: 'test-qr'
            }

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Loyalty QR Code</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">🎉 Welcome to Our Loyalty Program!</h1>
    <p>Hi ${testCustomer.name},</p>
    <p>Thank you for joining our loyalty program! Here's your personal QR code:</p>
    <div style="text-align: center; margin: 30px 0;">
        <img src="${testCustomer.qr_code_url}" alt="Your Personal QR Code" style="max-width: 250px;" />
    </div>
</body>
</html>`

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testCustomer.email,
                    message: emailHtml,
                    subject: '🎉 Welcome! Your Loyalty QR Code',
                    template: 'raw-html'
                })
            })

            const data = await response.json()
            setResult({
                type: 'qr',
                success: response.ok,
                status: response.status,
                data
            })
        } catch (error) {
            setResult({
                type: 'qr',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Email Debug Page</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={testDirectEmail}
                        disabled={loading}
                        className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Test Direct Email
                    </button>

                    <button
                        onClick={testRegistrationEmail}
                        disabled={loading}
                        className="bg-green-600 text-white p-4 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        Test Registration Email
                    </button>

                    <button
                        onClick={testQREmail}
                        disabled={loading}
                        className="bg-purple-600 text-white p-4 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        Test QR Email
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={testResendDirect}
                        disabled={loading}
                        className="bg-red-600 text-white p-4 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Test Resend API Direct
                    </button>

                    <button
                        onClick={testFullRegistration}
                        disabled={loading}
                        className="bg-yellow-600 text-white p-4 rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                        Test Full Registration Flow
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2">Testing email...</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Email Test Result
                        </h2>

                        <div className={`p-4 rounded mb-4 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <p className="font-semibold">
                                {result.success ? '✅ Success' : '❌ Failed'}
                            </p>
                            {result.status && <p>Status: {result.status}</p>}
                        </div>

                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Environment Info</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</p>
                        <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}