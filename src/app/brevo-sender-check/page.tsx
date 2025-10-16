'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react'

export default function BrevoSenderCheckPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const checkSenderStatus = async () => {
        setLoading(true)
        setResult(null)

        try {
            console.log('🔍 Checking Brevo sender verification...')

            const response = await fetch('/api/check-brevo-sender', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            console.log('📥 Sender check response:', data)

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

    // Auto-check on page load
    useEffect(() => {
        checkSenderStatus()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <Settings className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Brevo Sender Verification Check</h1>
                    <p className="text-gray-600 mt-2">Check if your sender email is verified in Brevo</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={checkSenderStatus}
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Checking Sender Status...</span>
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                <span>Check Sender Verification</span>
                            </>
                        )}
                    </button>

                    {result && (
                        <div className={`mt-6 p-4 rounded border ${result.success ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center mb-2">
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                )}
                                <h3 className={`font-medium ${result.success ? 'text-blue-900' : 'text-red-900'}`}>
                                    {result.success ? 'Sender Status Retrieved' : 'Error Checking Senders'}
                                </h3>
                            </div>

                            {result.success && result.data?.senders && (
                                <div className="space-y-4">
                                    <div className="bg-blue-100 p-3 rounded">
                                        <p className="text-blue-800 font-medium">Current Sender Email: {result.data.currentSenderEmail}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-2">Verified Senders in Brevo:</h4>
                                        {result.data.senders.length > 0 ? (
                                            <div className="space-y-2">
                                                {result.data.senders.map((sender: any, index: number) => (
                                                    <div key={index} className="bg-white p-3 rounded border border-blue-200">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{sender.email}</p>
                                                                <p className="text-sm text-gray-600">{sender.name}</p>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {sender.active ? (
                                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                                        ✅ Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                                        ❌ Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                                                <div className="flex items-center">
                                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                                                    <div>
                                                        <p className="text-yellow-800 font-medium">No Verified Senders Found!</p>
                                                        <p className="text-yellow-700 text-sm mt-1">
                                                            This is why your emails aren't being delivered. You need to verify a sender email in Brevo.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Check if current sender is verified */}
                                    {result.data.currentSenderEmail && (
                                        <div className="mt-4">
                                            {result.data.senders.some((s: any) => s.email === result.data.currentSenderEmail && s.active) ? (
                                                <div className="bg-green-50 border border-green-200 p-4 rounded">
                                                    <div className="flex items-center">
                                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                        <div>
                                                            <p className="text-green-800 font-medium">✅ Current sender email is verified!</p>
                                                            <p className="text-green-700 text-sm mt-1">
                                                                Your emails should be delivered successfully.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-red-50 border border-red-200 p-4 rounded">
                                                    <div className="flex items-center">
                                                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                                        <div>
                                                            <p className="text-red-800 font-medium">❌ Current sender email is NOT verified!</p>
                                                            <p className="text-red-700 text-sm mt-1">
                                                                Email: <code className="bg-red-100 px-1 rounded">{result.data.currentSenderEmail}</code> needs to be verified in Brevo.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!result.success && (
                                <div className="text-red-700">
                                    <p className="mb-2">❌ Failed to check sender status</p>
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

                    <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                        <h3 className="font-medium text-yellow-900 mb-2">🔧 How to Fix Email Delivery Issues:</h3>
                        <div className="text-yellow-800 text-sm space-y-2">
                            <div className="flex items-start space-x-2">
                                <span className="font-bold">1.</span>
                                <div>
                                    <p>Go to <a href="https://app.brevo.com/settings/senders" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                                        Brevo Senders Settings <ExternalLink className="w-3 h-3 ml-1" />
                                    </a></p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="font-bold">2.</span>
                                <p>Add and verify your sender email address</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="font-bold">3.</span>
                                <p>Update your .env.local file with the verified email</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="font-bold">4.</span>
                                <p>Test again using the verified sender email</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        <a
                            href="/test-brevo-simple"
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
                        >
                            Test Brevo API
                        </a>
                        <a
                            href="https://app.brevo.com/settings/senders"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded text-center hover:bg-orange-700 inline-flex items-center justify-center"
                        >
                            Brevo Senders <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}