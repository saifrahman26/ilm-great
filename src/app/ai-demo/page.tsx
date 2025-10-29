'use client'

import { useState } from 'react'
import { Sparkles, Mail, BarChart3, Users, RefreshCw, Send, CheckCircle } from 'lucide-react'

export default function AIDemoPage() {
    const [dashboardInsights, setDashboardInsights] = useState('')
    const [emailContent, setEmailContent] = useState('')
    const [loading, setLoading] = useState({ dashboard: false, email: false, reminder: false, winback: false })
    const [results, setResults] = useState({ dashboard: false, email: false, reminder: false, winback: false })

    const testDashboardInsights = async () => {
        setLoading(prev => ({ ...prev, dashboard: true }))
        try {
            const response = await fetch('/api/ai/dashboard-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: 'demo-business-id' })
            })
            const data = await response.json()
            setDashboardInsights(data.insights || data.fallbackInsights?.join('\n\n') || 'No insights available')
            setResults(prev => ({ ...prev, dashboard: data.success }))
        } catch (error) {
            setDashboardInsights(`Error: ${error}`)
        } finally {
            setLoading(prev => ({ ...prev, dashboard: false }))
        }
    }

    const testEmailGeneration = async () => {
        setLoading(prev => ({ ...prev, email: true }))
        try {
            const response = await fetch('/api/ai/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: 'Demo Coffee Shop',
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
            setEmailContent(data.content || 'No content generated')
            setResults(prev => ({ ...prev, email: data.success }))
        } catch (error) {
            setEmailContent(`Error: ${error}`)
        } finally {
            setLoading(prev => ({ ...prev, email: false }))
        }
    }

    const testPendingRewardReminder = async () => {
        setLoading(prev => ({ ...prev, reminder: true }))
        try {
            const response = await fetch('/api/ai/send-pending-reward-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: 'demo-customer-id',
                    businessId: 'demo-business-id'
                })
            })
            const data = await response.json()
            setResults(prev => ({ ...prev, reminder: data.success }))
        } catch (error) {
            console.error('Reminder test error:', error)
        } finally {
            setLoading(prev => ({ ...prev, reminder: false }))
        }
    }

    const testWinBackEmail = async () => {
        setLoading(prev => ({ ...prev, winback: true }))
        try {
            const response = await fetch('/api/ai/send-winback-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: 'demo-customer-id',
                    businessId: 'demo-business-id',
                    specialOffer: '20% off your next visit'
                })
            })
            const data = await response.json()
            setResults(prev => ({ ...prev, winback: data.success }))
        } catch (error) {
            console.error('Win-back test error:', error)
        } finally {
            setLoading(prev => ({ ...prev, winback: false }))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">AI Integration Demo</h1>
                                <p className="text-blue-100 mt-2">Test all AI-powered features of LinkLoyal</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Dashboard Insights Test */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-xl font-semibold text-gray-900">Dashboard Insights</h2>
                                        {results.dashboard && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <button
                                        onClick={testDashboardInsights}
                                        disabled={loading.dashboard}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
                                    >
                                        {loading.dashboard ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Generating Insights...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Test Dashboard AI
                                            </>
                                        )}
                                    </button>
                                    {dashboardInsights && (
                                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                                            <h3 className="font-medium text-gray-900 mb-2">AI-Generated Insights:</h3>
                                            <div className="text-sm text-gray-700 whitespace-pre-line">
                                                {dashboardInsights}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Email Generation Test */}
                                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Mail className="w-6 h-6 text-green-600" />
                                        <h2 className="text-xl font-semibold text-gray-900">Email Generation</h2>
                                        {results.email && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <button
                                        onClick={testEmailGeneration}
                                        disabled={loading.email}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
                                    >
                                        {loading.email ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Generating Email...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-5 h-5" />
                                                Test Email AI
                                            </>
                                        )}
                                    </button>
                                    {emailContent && (
                                        <div className="bg-white rounded-lg p-4 border border-green-100">
                                            <h3 className="font-medium text-gray-900 mb-2">AI-Generated Email:</h3>
                                            <div className="text-sm text-gray-700">
                                                {emailContent}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Advanced Features */}
                            <div className="space-y-6">
                                {/* Pending Reward Reminder Test */}
                                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-6 h-6 text-yellow-600" />
                                        <h2 className="text-xl font-semibold text-gray-900">Reward Reminders</h2>
                                        {results.reminder && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <button
                                        onClick={testPendingRewardReminder}
                                        disabled={loading.reminder}
                                        className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading.reminder ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Testing Reminder...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Test Reward Reminder
                                            </>
                                        )}
                                    </button>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Tests AI-powered pending reward reminder emails
                                    </p>
                                </div>

                                {/* Win-Back Email Test */}
                                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Mail className="w-6 h-6 text-purple-600" />
                                        <h2 className="text-xl font-semibold text-gray-900">Win-Back Campaigns</h2>
                                        {results.winback && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <button
                                        onClick={testWinBackEmail}
                                        disabled={loading.winback}
                                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading.winback ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Testing Win-Back...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Test Win-Back Email
                                            </>
                                        )}
                                    </button>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Tests AI-powered inactive customer win-back emails
                                    </p>
                                </div>

                                {/* AI Status Summary */}
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Integration Status</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Dashboard Analytics</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${results.dashboard ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {results.dashboard ? 'Working' : 'Not Tested'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Email Generation</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${results.email ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {results.email ? 'Working' : 'Not Tested'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Reward Reminders</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${results.reminder ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {results.reminder ? 'Working' : 'Not Tested'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Win-Back Campaigns</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${results.winback ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {results.winback ? 'Working' : 'Not Tested'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* API Information */}
                        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 Available AI Endpoints</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <h3 className="font-medium text-gray-900 mb-2">Dashboard Analytics</h3>
                                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        POST /api/ai/dashboard-insights
                                    </code>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <h3 className="font-medium text-gray-900 mb-2">Email Generation</h3>
                                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        POST /api/ai/generate-email
                                    </code>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <h3 className="font-medium text-gray-900 mb-2">Reward Reminders</h3>
                                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        POST /api/ai/send-pending-reward-reminder
                                    </code>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <h3 className="font-medium text-gray-900 mb-2">Win-Back Campaigns</h3>
                                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        POST /api/ai/send-winback-email
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}