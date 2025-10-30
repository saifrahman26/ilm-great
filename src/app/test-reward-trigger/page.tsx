'use client'

import { useState } from 'react'

export default function TestRewardTriggerPage() {
    const [email, setEmail] = useState('')
    const [customerName, setCustomerName] = useState('Test Customer')
    const [visitGoal, setVisitGoal] = useState(3)
    const [currentVisits, setCurrentVisits] = useState(2)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testRewardTrigger = async () => {
        if (!email) {
            alert('Please enter an email address')
            return
        }

        setLoading(true)
        setResult(null)

        try {
            // Simulate recording a visit that should trigger a reward
            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: 'test-customer-reward-trigger',
                    businessId: 'test-business-reward-trigger'
                })
            })

            const data = await response.json()

            setResult({
                success: response.ok,
                data: data,
                status: response.status,
                message: response.ok ? 'Visit recorded successfully' : 'Failed to record visit'
            })

        } catch (error) {
            console.error('Test reward trigger error:', error)
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: error
            })
        } finally {
            setLoading(false)
        }
    }

    const createTestData = async () => {
        setLoading(true)
        try {
            // Create test customer and business data
            const testCustomer = {
                id: 'test-customer-reward-trigger',
                name: customerName,
                email: email,
                phone: '+1234567890',
                visits: currentVisits,
                business_id: 'test-business-reward-trigger'
            }

            const testBusiness = {
                id: 'test-business-reward-trigger',
                name: 'Test Reward Shop',
                business_type: 'Coffee Shop',
                reward_title: 'Free Coffee',
                reward_description: 'Get a free coffee of your choice',
                visit_goal: visitGoal
            }

            // This would normally insert into database, but for testing we'll just show the setup
            setResult({
                success: true,
                message: 'Test data prepared',
                testSetup: {
                    customer: testCustomer,
                    business: testBusiness,
                    nextVisitWillTriggerReward: (currentVisits + 1) % visitGoal === 0
                }
            })

        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">🎯 Test Reward Trigger</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="test@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Visit Goal
                                </label>
                                <input
                                    type="number"
                                    value={visitGoal}
                                    onChange={(e) => setVisitGoal(parseInt(e.target.value))}
                                    min="1"
                                    max="10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Visits
                                </label>
                                <input
                                    type="number"
                                    value={currentVisits}
                                    onChange={(e) => setCurrentVisits(parseInt(e.target.value))}
                                    min="0"
                                    max="20"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Test Scenario:</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Customer has {currentVisits} visits</li>
                                <li>• Goal is {visitGoal} visits per reward</li>
                                <li>• Next visit will be visit #{currentVisits + 1}</li>
                                <li>• Will trigger reward: {(currentVisits + 1) % visitGoal === 0 ? '✅ YES' : '❌ NO'}</li>
                            </ul>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={createTestData}
                                disabled={loading}
                                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Preparing...' : 'Prepare Test Data'}
                            </button>

                            <button
                                onClick={testRewardTrigger}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Testing...' : 'Trigger Reward Test'}
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? '✅ Success' : '❌ Error'}
                            </h3>
                            <p className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                {result.message || result.error}
                            </p>

                            {(result.data || result.testSetup || result.details) && (
                                <div className="mt-3">
                                    <h4 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                        Details:
                                    </h4>
                                    <pre className={`mt-1 text-xs ${result.success ? 'text-green-600' : 'text-red-600'} bg-white p-2 rounded border overflow-auto max-h-64`}>
                                        {JSON.stringify(result.data || result.testSetup || result.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-medium text-yellow-800 mb-2">⚠️ Note:</h3>
                        <p className="text-sm text-yellow-700">
                            This test uses mock data. In a real scenario, the customer and business would need to exist in the database.
                            Check the browser console and server logs for detailed debugging information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}