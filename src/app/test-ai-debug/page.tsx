'use client'

import { useState } from 'react'
import { Brain, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestAIDebug() {
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testAI = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug-ai')
            const data = await response.json()
            setResults(data)
        } catch (error) {
            setResults({
                success: false,
                error: 'Failed to connect to debug endpoint',
                details: error
            })
        } finally {
            setLoading(false)
        }
    }

    const testDashboardInsights = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai/dashboard-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: 'test-business-id' })
            })
            const data = await response.json()
            setResults({ ...data, testType: 'Dashboard Insights' })
        } catch (error) {
            setResults({
                success: false,
                error: 'Failed to test dashboard insights',
                details: error,
                testType: 'Dashboard Insights'
            })
        } finally {
            setLoading(false)
        }
    }

    const testEmailGeneration = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: 'Test Coffee Shop',
                    businessType: 'Coffee Shop',
                    customerName: 'John Doe',
                    visitCount: 3,
                    visitGoal: 5,
                    rewardTitle: 'Free Coffee',
                    isRewardReached: false,
                    emailType: 'visit_confirmation'
                })
            })
            const data = await response.json()
            setResults({ ...data, testType: 'Email Generation' })
        } catch (error) {
            setResults({
                success: false,
                error: 'Failed to test email generation',
                details: error,
                testType: 'Email Generation'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Brain className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-gray-900">AI Debug Console</h1>
                    </div>
                    <p className="text-gray-600">Test AI functionality and debug issues</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={testAI}
                        disabled={loading}
                        className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Brain className="w-4 h-4" />
                        Test AI Service
                    </button>

                    <button
                        onClick={testDashboardInsights}
                        disabled={loading}
                        className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Test Dashboard
                    </button>

                    <button
                        onClick={testEmailGeneration}
                        disabled={loading}
                        className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        Test Email AI
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Testing AI functionality...</p>
                    </div>
                )}

                {results && !loading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            {results.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <h3 className="text-lg font-semibold">
                                {results.testType || 'AI Service'} Test Results
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${results.success
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {results.success ? 'Success' : 'Failed'}
                                </span>
                            </div>

                            {results.error && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Error</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-800 text-sm">{results.error}</p>
                                    </div>
                                </div>
                            )}

                            {results.testContent && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Generated Content</h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-green-800 text-sm whitespace-pre-wrap">{results.testContent}</p>
                                    </div>
                                </div>
                            )}

                            {results.content && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">AI Response</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-blue-800 text-sm whitespace-pre-wrap">{results.content}</p>
                                    </div>
                                </div>
                            )}

                            {results.insights && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">AI Insights</h4>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                        <p className="text-purple-800 text-sm whitespace-pre-wrap">{results.insights}</p>
                                    </div>
                                </div>
                            )}

                            {results.environment && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <pre className="text-xs text-gray-700">
                                            {JSON.stringify(results.environment, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Full Response</h4>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                                    <pre className="text-xs text-gray-700">
                                        {JSON.stringify(results, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}