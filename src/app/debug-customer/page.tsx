'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, User, Phone, Mail } from 'lucide-react'

export default function DebugCustomerPage() {
    const [formData, setFormData] = useState({
        businessId: '7952cb32-f70c-4a89-8c1c-8c29d326210a',
        name: 'Test Customer',
        phone: '1234567890',
        email: 'test@example.com'
    })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')

    const testRegistration = async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            console.log('🧪 Testing customer registration with:', formData)

            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            console.log('📥 Response status:', response.status)
            const data = await response.json()
            console.log('📥 Response data:', data)

            if (response.ok) {
                setResult(data)
            } else {
                setError(data.error || 'Registration failed')
            }
        } catch (err) {
            console.error('❌ Test error:', err)
            setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown'))
        }

        setLoading(false)
    }

    const testCreationAPI = async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            console.log('🧪 Testing creation API with:', formData)

            const response = await fetch('/api/test-customer-creation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            console.log('📥 Response status:', response.status)
            const data = await response.json()
            console.log('📥 Response data:', data)

            if (response.ok) {
                setResult(data)
            } else {
                setError(data.error || 'Test failed')
            }
        } catch (err) {
            console.error('❌ Test error:', err)
            setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown'))
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Customer Registration</h1>

                <div className="grid gap-6">
                    {/* Test Form */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Test Data</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business ID</label>
                                <input
                                    type="text"
                                    value={formData.businessId}
                                    onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={testRegistration}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Testing...' : 'Test Registration API'}
                            </button>
                            <button
                                onClick={testCreationAPI}
                                disabled={loading}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Testing...' : 'Test Creation API'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-center mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <h3 className="font-semibold text-red-900">Error</h3>
                            </div>
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                <h3 className="font-semibold text-green-900">Success</h3>
                            </div>
                            <pre className="text-sm text-green-800 bg-green-100 p-4 rounded overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Debug Instructions</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>1. Open browser console (F12) to see detailed logs</li>
                            <li>2. Test Registration API - Tests the main customer registration endpoint</li>
                            <li>3. Test Creation API - Tests the debug endpoint with step-by-step validation</li>
                            <li>4. Check the response data and console logs for specific error details</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}