'use client'

import { useState } from 'react'
import { Sparkles, Mail, RefreshCw, Copy, Check } from 'lucide-react'

export default function TestAIEmail() {
    const [emailContent, setEmailContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [formData, setFormData] = useState({
        businessName: 'Durer Coffee Shop',
        businessType: 'Coffee Shop',
        customerName: 'John Doe',
        visitCount: 3,
        visitGoal: 5,
        rewardTitle: 'Free Coffee',
        isRewardReached: false,
        emailType: 'visit_confirmation'
    })

    const generateEmail = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai/generate-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if (data.success) {
                setEmailContent(data.content)
            } else {
                setEmailContent(`Error: ${data.error}`)
            }
        } catch (error) {
            setEmailContent(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(emailContent)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">AI Email Generator</h1>
                                <p className="text-blue-100 mt-2">Test AI-powered personalized email content</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Form */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Parameters</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Type
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessType}
                                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reward Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.rewardTitle}
                                            onChange={(e) => setFormData({ ...formData, rewardTitle: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Visit Count
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.visitCount}
                                            onChange={(e) => setFormData({ ...formData, visitCount: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Visit Goal
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.visitGoal}
                                            onChange={(e) => setFormData({ ...formData, visitGoal: parseInt(e.target.value) || 5 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Type
                                        </label>
                                        <select
                                            value={formData.emailType}
                                            onChange={(e) => setFormData({ ...formData, emailType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="visit_confirmation">Visit Confirmation</option>
                                            <option value="reward_earned">Reward Earned</option>
                                            <option value="inactive_reminder">Inactive Reminder</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isRewardReached}
                                            onChange={(e) => setFormData({ ...formData, isRewardReached: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Reward Reached</span>
                                    </label>
                                </div>

                                <button
                                    onClick={generateEmail}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate AI Email
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Result */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Generated Content</h2>
                                    {emailContent && (
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-green-600">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4 text-gray-600" />
                                                    <span className="text-sm text-gray-600">Copy</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 min-h-[300px] border-2 border-dashed border-gray-300">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                                <p className="text-gray-600">AI is crafting your personalized email...</p>
                                            </div>
                                        </div>
                                    ) : emailContent ? (
                                        <div className="prose prose-sm max-w-none">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                                                    <Mail className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Email Content Preview
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                                                    {emailContent}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <div className="text-center">
                                                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p>Click "Generate AI Email" to see personalized content</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}