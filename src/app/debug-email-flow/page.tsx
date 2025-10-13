'use client'

import { useState } from 'react'
import { Mail, User, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function DebugEmailFlowPage() {
    const [email, setEmail] = useState('warriorsaifdurer@gmail.com')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const runEmailTests = async () => {
        setLoading(true)
        setResults([])
        const testResults: any[] = []

        try {
            // Test 1: Direct email API
            testResults.push({ step: 'Testing direct email API...', status: 'running' })
            setResults([...testResults])

            const directEmailResponse = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    message: 'Test email from debug flow',
                    subject: 'Debug Test Email'
                })
            })
            const directEmailResult = await directEmailResponse.json()

            testResults[testResults.length - 1] = {
                step: 'Direct email API',
                status: directEmailResponse.ok ? 'success' : 'failed',
                result: directEmailResult
            }
            setResults([...testResults])

            // Test 2: sendQRCodeToCustomer function
            testResults.push({ step: 'Testing sendQRCodeToCustomer function...', status: 'running' })
            setResults([...testResults])

            const qrTestResponse = await fetch('/api/test-registration-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            })
            const qrTestResult = await qrTestResponse.json()

            testResults[testResults.length - 1] = {
                step: 'sendQRCodeToCustomer function',
                status: qrTestResponse.ok ? 'success' : 'failed',
                result: qrTestResult
            }
            setResults([...testResults])

            // Test 3: Full customer registration
            testResults.push({ step: 'Testing full customer registration...', status: 'running' })
            setResults([...testResults])

            const registrationResponse = await fetch('/api/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: '6be1dbc3-0832-4617-b143-d7135590374a',
                    name: 'Debug Flow Customer',
                    phone: `+1555${Date.now().toString().slice(-6)}`,
                    email: email
                })
            })
            const registrationResult = await registrationResponse.json()

            testResults[testResults.length - 1] = {
                step: 'Full customer registration',
                status: registrationResponse.ok ? 'success' : 'failed',
                result: registrationResult
            }
            setResults([...testResults])

        } catch (error) {
            testResults.push({
                step: 'Error occurred',
                status: 'failed',
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            })
            setResults([...testResults])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Email Flow Debug</h1>
                    <p className="text-gray-600 mt-2">Debug why emails aren't being received</p>
                </div>

                <div className="space-y-4 mb-6">
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
                        onClick={runEmailTests}
                        disabled={loading || !email}
                        className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Running Tests...</span>
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                <span>Run Email Flow Tests</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Test Results */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Test Results:</h3>
                        {results.map((result, index) => (
                            <div key={index} className={`p-4 rounded border ${result.status === 'success' ? 'bg-green-50 border-green-200' :
                                    result.status === 'failed' ? 'bg-red-50 border-red-200' :
                                        'bg-yellow-50 border-yellow-200'
                                }`}>
                                <div className="flex items-center mb-2">
                                    {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                                    {result.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600 mr-2" />}
                                    {result.status === 'running' && <Clock className="w-5 h-5 text-yellow-600 mr-2 animate-spin" />}
                                    <h4 className={`font-medium ${result.status === 'success' ? 'text-green-900' :
                                            result.status === 'failed' ? 'text-red-900' :
                                                'text-yellow-900'
                                        }`}>
                                        {result.step}
                                    </h4>
                                </div>
                                {result.result && (
                                    <pre className="text-sm overflow-auto whitespace-pre-wrap bg-white p-2 rounded border">
                                        {JSON.stringify(result.result, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Email Troubleshooting Guide */}
                <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-3">Email Troubleshooting:</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                        <li>✅ Check your spam/junk folder</li>
                        <li>✅ Emails are sent to: {email}</li>
                        <li>✅ Email service: Resend API</li>
                        <li>✅ Development mode: All emails go to warriorsaifdurer@gmail.com</li>
                        <li>✅ Check browser developer console for errors</li>
                        <li>✅ Verify email address is correct</li>
                    </ul>
                </div>

                <div className="mt-4 flex space-x-3">
                    <a
                        href="/test-qr-email"
                        className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-center hover:bg-teal-700"
                    >
                        QR Email Test
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
    )
}