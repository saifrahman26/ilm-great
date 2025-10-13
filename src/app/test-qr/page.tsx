'use client'

import { useState } from 'react'
import { QrCode, User, Scan } from 'lucide-react'

export default function TestQRPage() {
    const [qrInput, setQrInput] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testQRCode = async () => {
        if (!qrInput.trim()) return

        setLoading(true)
        setResult(null)

        try {
            // Test the record-visit API with the QR data
            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: qrInput.match(/^[0-9a-f-]{36}$/i) ? qrInput : null,
                    qrData: !qrInput.match(/^[0-9a-f-]{36}$/i) ? qrInput : null
                })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ error: 'Network error', details: error })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <QrCode className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">QR Code Test</h1>
                    <p className="text-gray-600 mt-2">Test QR code scanning functionality</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            QR Code Data or Customer ID
                        </label>
                        <input
                            type="text"
                            value={qrInput}
                            onChange={(e) => setQrInput(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter QR code data or customer ID"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Examples: Customer UUID, business-phone-timestamp format, etc.
                        </p>
                    </div>

                    <button
                        onClick={testQRCode}
                        disabled={loading || !qrInput.trim()}
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Testing...</span>
                            </>
                        ) : (
                            <>
                                <Scan className="w-4 h-4" />
                                <span>Test QR Code</span>
                            </>
                        )}
                    </button>

                    {result && (
                        <div className="mt-6 p-4 bg-gray-50 rounded border">
                            <h3 className="font-medium mb-2">Result:</h3>
                            <pre className="text-sm overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">QR Code System Info:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>✅ Scanner now supports multiple QR formats</li>
                            <li>✅ Customer ID (UUID) format</li>
                            <li>✅ Legacy business-phone-timestamp format</li>
                            <li>✅ Phone number lookup fallback</li>
                            <li>✅ Visit recording and reward tracking</li>
                        </ul>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        <a
                            href="/scanner"
                            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700"
                        >
                            <Scan className="w-4 h-4 inline mr-2" />
                            Camera Scanner
                        </a>
                        <a
                            href="/register"
                            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            Register Customer
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}