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
                    subject: 'LoyalLink Email Test',
                    message: 'This is a test email from LoyalLink!',
                    customerName: 'Test User'
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
                <h1 className="text-2xl font-bold mb-4">Email Test</h1>

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
                            <p>{result.success ? '✅ Success!' : '❌ Failed'}</p>
                            <pre className="text-xs mt-2 overflow-auto">
                                {JSON.stringify(result.data || result.error, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}