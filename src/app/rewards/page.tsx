'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/DashboardLayout'
import {
    Gift,
    Target,
    Award,
    Save,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'

const rewardSchema = z.object({
    reward_title: z.string().min(3, 'Reward title must be at least 3 characters'),
    reward_description: z.string().min(10, 'Reward description must be at least 10 characters'),
    visit_goal: z.number().min(1, 'Visit goal must be at least 1').max(20, 'Visit goal cannot exceed 20'),
})

type RewardForm = z.infer<typeof rewardSchema>

export default function RewardsPage() {
    const { user, business, loading } = useAuth()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm<RewardForm>({
        resolver: zodResolver(rewardSchema),
        defaultValues: {
            reward_title: '',
            reward_description: '',
            visit_goal: 5
        }
    })

    // Load existing business data
    useEffect(() => {
        if (business) {
            reset({
                reward_title: business.reward_title || '',
                reward_description: business.reward_description || '',
                visit_goal: business.visit_goal || 5
            })
        }
    }, [business, reset])

    const onSubmit = async (data: RewardForm) => {
        if (!business) return

        setSaving(true)
        setError('')
        setSuccess('')

        // Use API endpoint with service role key to bypass RLS issues
        try {
            console.log('🚀 Submitting reward update via API:', data)
            console.log('👤 User ID:', user?.id)
            console.log('🏢 Business ID:', business.id)

            const response = await fetch('/api/update-rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: business.id,
                    userId: user?.id,
                    reward_title: data.reward_title,
                    reward_description: data.reward_description,
                    visit_goal: data.visit_goal
                })
            })

            const result = await response.json()
            console.log('📡 API Response:', result)

            if (response.ok) {
                console.log('✅ Rewards updated successfully')
                setSuccess('Reward settings updated successfully!')
                // Refresh the page after a short delay
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            } else {
                console.error('❌ API Error:', result)
                setError(result.error || 'Failed to update reward settings')
            }
        } catch (err) {
            console.error('❌ Submit error:', err)
            setError('Failed to update reward settings: ' + (err instanceof Error ? err.message : 'Unknown error'))
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <DashboardLayout title="Reward Settings" subtitle="Configure your loyalty program rewards">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to access reward settings.</p>
                    <Link href="/login" className="mt-4 inline-block bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout title="Reward Settings" subtitle="Configure your loyalty program rewards">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Gift className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Loyalty Reward Configuration
                        </h2>
                        <p className="text-gray-600">
                            Set up what customers earn when they complete their loyalty journey
                        </p>
                    </div>

                    {/* Current Active Reward Display */}
                    {business && (business.reward_title || business.reward_description) && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                            <div className="flex items-center mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold text-green-900">Current Active Reward</h3>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Gift className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-gray-900">
                                        {business.reward_title || 'No reward title set'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    {business.reward_description || 'No reward description set'}
                                </p>
                                <p className="text-xs text-green-600 font-medium">
                                    Earned after {business.visit_goal || 5} visits
                                </p>
                            </div>
                        </div>
                    )}

                    {/* No Reward Set Message */}
                    {business && !business.reward_title && !business.reward_description && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                            <div className="flex items-center mb-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                                <h3 className="text-lg font-semibold text-yellow-900">No Reward Configured</h3>
                            </div>
                            <p className="text-yellow-800">
                                Set up your first loyalty reward below to start engaging customers with your loyalty program.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Visit Goal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Target className="w-4 h-4 inline mr-1" />
                                Visits Required for Reward *
                            </label>
                            <select
                                {...register('visit_goal', { valueAsNumber: true })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                                    <option key={num} value={num}>
                                        {num} visit{num > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.visit_goal && (
                                <p className="mt-1 text-sm text-red-600">{errors.visit_goal.message}</p>
                            )}
                        </div>

                        {/* Reward Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Award className="w-4 h-4 inline mr-1" />
                                Reward Title *
                            </label>
                            <input
                                {...register('reward_title')}
                                type="text"
                                placeholder="e.g., Free Coffee, 20% Off, Free Dessert"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            />
                            {errors.reward_title && (
                                <p className="mt-1 text-sm text-red-600">{errors.reward_title.message}</p>
                            )}
                        </div>

                        {/* Reward Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reward Description *
                            </label>
                            <textarea
                                {...register('reward_description')}
                                rows={3}
                                placeholder="Describe what customers get when they earn this reward..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                            />
                            {errors.reward_description && (
                                <p className="mt-1 text-sm text-red-600">{errors.reward_description.message}</p>
                            )}
                        </div>

                        {/* Reward Templates */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Gift className="w-4 h-4 mr-2" />
                                Quick Templates:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset({
                                            reward_title: 'Free Coffee',
                                            reward_description: 'Enjoy a complimentary coffee of your choice on us! Valid for any size, any blend.',
                                            visit_goal: 5
                                        })
                                    }}
                                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 text-sm">☕ Free Coffee</div>
                                    <div className="text-xs text-gray-600 mt-1">After 5 visits</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset({
                                            reward_title: '20% Off Next Purchase',
                                            reward_description: 'Get 20% discount on your next purchase. Valid for 30 days from earning date.',
                                            visit_goal: 3
                                        })
                                    }}
                                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 text-sm">💰 20% Off</div>
                                    <div className="text-xs text-gray-600 mt-1">After 3 visits</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset({
                                            reward_title: 'Free Dessert',
                                            reward_description: 'Choose any dessert from our menu absolutely free! Perfect way to end your meal.',
                                            visit_goal: 4
                                        })
                                    }}
                                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 text-sm">🍰 Free Dessert</div>
                                    <div className="text-xs text-gray-600 mt-1">After 4 visits</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset({
                                            reward_title: 'Buy 1 Get 1 Free',
                                            reward_description: 'Purchase any item and get another of equal or lesser value absolutely free!',
                                            visit_goal: 6
                                        })
                                    }}
                                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 text-sm">🎁 Buy 1 Get 1</div>
                                    <div className="text-xs text-gray-600 mt-1">After 6 visits</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset({
                                            reward_title: 'VIP Treatment',
                                            reward_description: 'Skip the line and get priority service plus a complimentary upgrade on your order.',
                                            visit_goal: 8
                                        })
                                    }}
                                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 text-sm">👑 VIP Treatment</div>
                                    <div className="text-xs text-gray-600 mt-1">After 8 visits</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset({
                                            reward_title: 'Free Meal',
                                            reward_description: 'Enjoy a complete meal on the house! Choose from our special loyalty menu.',
                                            visit_goal: 10
                                        })
                                    }}
                                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 text-sm">🍽️ Free Meal</div>
                                    <div className="text-xs text-gray-600 mt-1">After 10 visits</div>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Click any template to auto-fill the form, then customize as needed
                            </p>
                        </div>

                        {/* Preview */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Reward Preview:
                            </h4>
                            <div className="bg-white rounded-lg p-4 border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Gift className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-gray-900">
                                        {watch('reward_title') || 'Your Reward Title'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    {watch('reward_description') || 'Your reward description will appear here...'}
                                </p>
                                <p className="text-xs text-purple-600">
                                    Earned after {watch('visit_goal') || 5} visits
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Reward Settings</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Tips */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Great Rewards:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Keep visit goals between 3-8 for best engagement</li>
                            <li>• Make rewards valuable but sustainable for your business</li>
                            <li>• Clear, specific descriptions work better than vague ones</li>
                            <li>• Consider seasonal or limited-time rewards to create urgency</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}