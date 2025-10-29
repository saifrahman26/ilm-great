'use client'

import { useState } from 'react'
import { Mail, Sparkles, Send, User, Building, Calendar, Gift } from 'lucide-react'

export default function TestInactiveEmailPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [testData, setTestData] = useState({
        businessName: 'Coffee Corner Café',
        businessCategory: 'cafe',
        customCategory: '',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        visitCount: 3,
        visitGoal: 5,
        rewardTitle: 'Free Coffee',
        daysSinceLastVisit: 10
    })

    const businessCategories = [
        { value: 'cafe', label: '☕ Cafe & Coffee Shop' },
        { value: 'restaurant', label: '🍽️ Restaurant' },
        { value: 'food_hall', label: '🍕 Food Hall & Fast Food' },
        { value: 'bakery', label: '🥖 Bakery & Pastry Shop' },
        { value: 'salon', label: '💇 Hair Salon' },
        { value: 'beauty_parlor', label: '💄 Beauty Parlor & Spa' },
        { value: 'boutique', label: '👗 Boutique & Fashion Store' },
        { value: 'mens_wear', label: '👔 Men\'s Clothing Store' },
        { value: 'womens_wear', label: '👚 Women\'s Clothing Store' },
        { value: 'retail_store', label: '🛍️ Retail & General Store' },
        { value: 'pharmacy', label: '💊 Pharmacy & Medical Store' },
        { value: 'gym_fitness', label: '💪 Gym & Fitness Center' },
        { value: 'electronics', label: '📱 Electronics Store' },
        { value: 'jewelry', label: '💎 Jewelry Store' },
        { value: 'automotive', label: '🚗 Automotive Services' },
        { value: 'other', label: '📝 Other (Please specify)' }
    ]

    const testGenerateMessage = async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const response = await fetch('/api/generate-inactive-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: testData.businessName,
                    businessCategory: testData.businessCategory,
                    customCategory: testData.customCategory,
                    rewardTitle: testData.rewardTitle,
                    visitGoal: testData.visitGoal
                })
            })

            const data = await response.json()

            if (response.ok) {
                setResult({
                    type: 'generate',
                    success: true,
                    message: data.message,
                    offer: data.offer,
                    businessType: data.businessType
                })
            } else {
                setError(`Generation failed: ${data.error}`)
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    const testSendEmail = async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: testData.customerEmail,
                    template: 'inactive-customer',
                    customerName: testData.customerName,
                    businessName: testData.businessName,
                    context: {
                        visitCount: testData.visitCount,
                        visitGoal: testData.visitGoal,
                        rewardTitle: testData.rewardTitle,
                        daysSinceLastVisit: testData.daysSinceLastVisit,
                        businessCategory: testData.businessCategory,
                        specialOffer: '20% off your next purchase'
                    }
                })
            })

            const data = await response.json()

            if (response.ok) {
                setResult({
                    type: 'send',
                    success: true,
                    data
                })
            } else {
                setError(`Email sending failed: ${data.error}`)
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    const testBulkInactiveEmails = async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const response = await fetch('/api/send-inactive-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (response.ok) {
                setResult({
                    type: 'bulk',
                    success: true,
                    data
                })
            } else {
                setError(`Bulk email failed: ${data.error}`)
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Mail className="w-6 h-6 mr-2 text-blue-600" />
                        🧪 Inactive Customer Email Test Center
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Test Data Configuration */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Configuration</h3>

                            {/* Business Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Building className="w-4 h-4 inline mr-1" />
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    value={testData.businessName}
                                    onChange={(e) => setTestData({ ...testData, businessName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Building className="w-4 h-4 inline mr-1" />
                                    Business Category
                                </label>
                                <select
                                    value={testData.businessCategory}
                                    onChange={(e) => setTestData({ ...testData, businessCategory: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {businessCategories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {testData.businessCategory === 'other' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Custom Category
                                    </label>
                                    <input
                                        type="text"
                                        value={testData.customCategory}
                                        onChange={(e) => setTestData({ ...testData, customCategory: e.target.value })}
                                        placeholder="e.g., Pet Store, Book Shop"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {/* Customer Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={testData.customerName}
                                    onChange={(e) => setTestData({ ...testData, customerName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Customer Email
                                </label>
                                <input
                                    type="email"
                                    value={testData.customerEmail}
                                    onChange={(e) => setTestData({ ...testData, customerEmail: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Loyalty Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Visit Count
                                    </label>
                                    <input
                                        type="number"
                                        value={testData.visitCount}
                                        onChange={(e) => setTestData({ ...testData, visitCount: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Visit Goal
                                    </label>
                                    <input
                                        type="number"
                                        value={testData.visitGoal}
                                        onChange={(e) => setTestData({ ...testData, visitGoal: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Gift className="w-4 h-4 inline mr-1" />
                                    Reward Title
                                </label>
                                <input
                                    type="text"
                                    value={testData.rewardTitle}
                                    onChange={(e) => setTestData({ ...testData, rewardTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Days Since Last Visit
                                </label>
                                <input
                                    type="number"
                                    value={testData.daysSinceLastVisit}
                                    onChange={(e) => setTestData({ ...testData, daysSinceLastVisit: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Test Actions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Actions</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={testGenerateMessage}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    <span>Generate AI Message</span>
                                </button>

                                <button
                                    onClick={testSendEmail}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    <span>Send Test Email</span>
                                </button>

                                <button
                                    onClick={testBulkInactiveEmails}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Mail className="w-4 h-4" />
                                    )}
                                    <span>Test Bulk Inactive Emails</span>
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                    <p className="font-medium">Error:</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {/* Results Display */}
                            {result && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                    <h4 className="font-medium text-green-800 mb-2">
                                        {result.type === 'generate' && '🤖 AI Message Generated'}
                                        {result.type === 'send' && '📧 Email Sent Successfully'}
                                        {result.type === 'bulk' && '📬 Bulk Email Results'}
                                    </h4>

                                    {result.type === 'generate' && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-green-700">
                                                <strong>Business Type:</strong> {result.businessType}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                <strong>Special Offer:</strong> {result.offer}
                                            </p>
                                            <div className="bg-white p-3 rounded border">
                                                <p className="text-sm text-gray-800 whitespace-pre-line">
                                                    {result.message}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {result.type === 'send' && (
                                        <div className="text-sm text-green-700">
                                            <p>Email sent to: {testData.customerEmail}</p>
                                            <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {result.type === 'bulk' && (
                                        <div className="text-sm text-green-700">
                                            <p>Total emails sent: {result.data.totalEmailsSent}</p>
                                            <p>Businesses processed: {result.data.businessesProcessed}</p>
                                            <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(result.data.results, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Testing Instructions</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>1. Generate AI Message:</strong> Test the AI message generation with different business categories</p>
                        <p><strong>2. Send Test Email:</strong> Send a test inactive customer email to the specified address</p>
                        <p><strong>3. Bulk Email Test:</strong> Test the bulk inactive email system (processes all businesses)</p>
                        <p><strong>Note:</strong> Make sure you have valid email configuration and database setup</p>
                    </div>
                </div>
            </div>
        </div>
    )
}