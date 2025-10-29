'use client'

import { useState } from 'react'
import { Sparkles, Brain, Mail, BarChart3, Users, Target, TrendingUp, RefreshCw } from 'lucide-react'

export default function AIDemoPage() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState('')

    const testDashboardInsights = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai/dashboard-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: 'demo-business-id' })
            })
            const data = await response.json()
            setResult(JSON.stringify(data, null, 2))
        } catch (error) {
            setResult(`Error: ${error}`)
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
                    businessName: 'Durer Coffee Shop',
                    businessType: 'Coffee Shop',
                    customerName: 'John Doe',
                    visitCount: 4,
                    visitGoal: 5,
                    rewardTitle: 'Free Coffee',
                    isRewardReached: false,
                    emailType: 'visit_confirmation'
                })
            })
            const data = await response.json()
            setResult(JSON.stringify(data, null, 2))
        } catch (error) {
            setResult(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    const testAIConnection = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/test-ai')
            const data = await response.json()
            setResult(JSON.stringify(data, null, 2))
        } catch (error) {
            setResult(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            AI Integration Demo
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Experience the power of AI-driven customer loyalty analytics and personalized email generation
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Dashboard Analytics</h3>
                        </div>
                        <p className="text-gray-600 mb-4">AI analyzes customer data to provide actionable business insights and recommendations.</p>
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Sparkles className="w-4 h-4" />
                            <span>Comprehensive business analysis</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Email Personalization</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Generate personalized email content based on customer behavior and business context.</p>
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                            <Sparkles className="w-4 h-4" />
                            <span>Psychology-based messaging</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Customer Engagement</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Automated win-back campaigns and reward reminders to boost customer retention.</p>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <Sparkles className="w-4 h-4" />
                            <span>Intelligent automation</span>
                        </div>
                    </div>
                </div>

                {/* Demo Interface */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'dashboard'
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <BarChart3 className="w-4 h-4 inline mr-2" />
                                Dashboard Insights
                            </button>
                            <button
                                onClick={() => setActiveTab('email')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'email'
                                        ? 'border-purple-500 text-purple-600 bg-purple-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email Generation
                            </button>
                            <button
                                onClick={() => setActiveTab('test')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'test'
                                        ? 'border-green-500 text-green-600 bg-green-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Target className="w-4 h-4 inline mr-2" />
                                AI Connection Test
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'dashboard' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Analytics Demo</h3>
                                <p className="text-gray-600 mb-6">
                                    Test the AI-powered dashboard insights that analyze customer data and provide actionable business recommendations.
                                </p>
                                <button
                                    onClick={testDashboardInsights}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <BarChart3 className="w-5 h-5" />
                                    )}
                                    {loading ? 'Generating Insights...' : 'Generate Dashboard Insights'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Generation Demo</h3>
                                <p className="text-gray-600 mb-6">
                                    Test the AI-powered email generation that creates personalized content based on customer context and business data.
                                </p>
                                <button
                                    onClick={testEmailGeneration}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Mail className="w-5 h-5" />
                                    )}
                                    {loading ? 'Generating Email...' : 'Generate Personalized Email'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'test' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Connection Test</h3>
                                <p className="text-gray-600 mb-6">
                                    Test the connection to the OpenRouter AI service and verify that the API key is working correctly.
                                </p>
                                <button
                                    onClick={testAIConnection}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Target className="w-5 h-5" />
                                    )}
                                    {loading ? 'Testing Connection...' : 'Test AI Connection'}
                                </button>
                            </div>
                        )}

                        {/* Results */}
                        {result && (
                            <div className="mt-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Results:</h4>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                        {result}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Features Overview */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6 text-center">AI-Powered Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Smart Analytics</h3>
                            <p className="text-sm opacity-90">Comprehensive business insights with growth indicators</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Personalized Emails</h3>
                            <p className="text-sm opacity-90">Context-aware email content generation</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Customer Retention</h3>
                            <p className="text-sm opacity-90">Automated win-back and engagement campaigns</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Growth Optimization</h3>
                            <p className="text-sm opacity-90">Data-driven recommendations for business growth</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}4">
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