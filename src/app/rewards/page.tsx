'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/DashboardLayout'
import {
    Gift,
    Target,
    Award,
    Save,
    Sparkles,
    CheckCircle,
    TrendingUp,
    Users,
    Star,
    Coffee,
    ShoppingBag,
    Scissors,
    Heart,
    Dumbbell,
    Car
} from 'lucide-react'
import Link from 'next/link'
import { CardSkeleton } from '@/components/LoadingSkeleton'

const rewardSchema = z.object({
    reward_title: z.string().min(3, 'Reward title must be at least 3 characters'),
    reward_description: z.string().min(10, 'Reward description must be at least 10 characters'),
    visit_goal: z.number().min(1, 'Visit goal must be at least 1').max(20, 'Visit goal cannot exceed 20'),
})

type RewardForm = z.infer<typeof rewardSchema>

interface RewardTemplate {
    title: string
    description: string
    visitGoal: number
    category: string
    icon: React.ReactNode
    color: string
    isPopular?: boolean
}

export default function RewardsPage() {
    const { user, business, loading } = useAuth()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<RewardForm>({
        resolver: zodResolver(rewardSchema),
    })

    const rewardTemplates: RewardTemplate[] = [
        // Food & Beverage
        { title: 'Free Coffee', description: 'Get a free coffee on us!', visitGoal: 5, category: 'food', icon: <Coffee className="w-5 h-5" />, color: 'bg-amber-500', isPopular: true },
        { title: 'Free Dessert', description: 'Choose any dessert from our menu', visitGoal: 4, category: 'food', icon: <Gift className="w-5 h-5" />, color: 'bg-pink-500' },
        { title: 'Buy 1 Get 1 Free', description: 'Buy one item and get another free', visitGoal: 6, category: 'food', icon: <Gift className="w-5 h-5" />, color: 'bg-green-500', isPopular: true },
        { title: 'Free Appetizer', description: 'Start your meal with a free appetizer', visitGoal: 4, category: 'food', icon: <Gift className="w-5 h-5" />, color: 'bg-orange-500' },

        // Retail
        { title: '20% Off', description: 'Get 20% off your next purchase', visitGoal: 3, category: 'retail', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-blue-500', isPopular: true },
        { title: '$10 Off', description: 'Get $10 off your next order', visitGoal: 8, category: 'retail', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-indigo-500' },
        { title: 'Free Shipping', description: 'Free shipping on your next online order', visitGoal: 3, category: 'retail', icon: <Car className="w-5 h-5" />, color: 'bg-teal-500' },

        // Beauty & Wellness
        { title: 'Free Haircut', description: 'Get a complimentary haircut', visitGoal: 5, category: 'beauty', icon: <Scissors className="w-5 h-5" />, color: 'bg-purple-500' },
        { title: 'Free Manicure', description: 'Enjoy a free manicure service', visitGoal: 4, category: 'beauty', icon: <Heart className="w-5 h-5" />, color: 'bg-rose-500' },

        // Fitness
        { title: 'Free Personal Training', description: 'One-on-one training session', visitGoal: 10, category: 'fitness', icon: <Dumbbell className="w-5 h-5" />, color: 'bg-red-500' },
        { title: 'Free Class', description: 'Join any group fitness class', visitGoal: 5, category: 'fitness', icon: <Users className="w-5 h-5" />, color: 'bg-emerald-500' },
    ]

    const categories = [
        { id: 'all', name: 'All Categories', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'food', name: 'Food & Beverage', icon: <Coffee className="w-4 h-4" /> },
        { id: 'retail', name: 'Retail & Shopping', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'beauty', name: 'Beauty & Wellness', icon: <Heart className="w-4 h-4" /> },
        { id: 'fitness', name: 'Fitness & Health', icon: <Dumbbell className="w-4 h-4" /> },
    ]

    const filteredTemplates = selectedCategory === 'all'
        ? rewardTemplates
        : rewardTemplates.filter(template => template.category === selectedCategory)

    // Load business data into form
    useEffect(() => {
        if (business) {
            setValue('reward_title', business.reward_title || '')
            setValue('reward_description', business.reward_description || '')
            setValue('visit_goal', business.visit_goal || 5)
        }
    }, [business, setValue])

    const selectTemplate = (template: RewardTemplate) => {
        setValue('reward_title', template.title)
        setValue('reward_description', template.description)
        setValue('visit_goal', template.visitGoal)
        setSuccess(`Template "${template.title}" applied! You can customize it below.`)
        setTimeout(() => setSuccess(''), 3000)
    }

    const onSubmit = async (data: RewardForm) => {
        if (!business) return

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            // Update business settings
            const { error: updateError } = await supabase
                .from('businesses')
                .update({
                    reward_title: data.reward_title,
                    reward_description: data.reward_description,
                    visit_goal: data.visit_goal,
                    reward_setup_completed: true,
                    setup_completed_at: new Date().toISOString(),
                })
                .eq('id', business.id)

            if (updateError) {
                throw new Error(updateError.message)
            }

            setSuccess('Reward settings saved successfully!')

            // Refresh the page to update the auth context
            setTimeout(() => {
                window.location.reload()
            }, 1500)

        } catch (err) {
            console.error('Reward settings update error:', err)
            setError(err instanceof Error ? err.message : 'Failed to update reward settings')
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <DashboardLayout
                title="Reward Settings"
                subtitle="Configure your loyalty program rewards"
            >
                <div className="space-y-6">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </DashboardLayout>
        )
    }

    // Show loading animation while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Show login prompt only after loading is complete and user is not authenticated
    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to access reward settings.</p>
                    <Link href="/login" className="bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout
            title="Reward Settings"
            subtitle="Configure and manage your loyalty program rewards"
        >
            <div className="space-y-8">
                {/* Success/Error Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs">!</span>
                        </div>
                        <div>
                            <h4 className="text-red-800 font-medium">Error</h4>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-green-800 font-medium">Success</h4>
                            <p className="text-green-700 text-sm mt-1">{success}</p>
                        </div>
                    </div>
                )}

                {/* Current Reward Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Award className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Current Reward Program</h2>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                                <Star className="w-4 h-4" />
                                <span className="text-sm">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Gift className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-medium text-gray-900">
                                    {business.reward_title || 'No reward configured'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {business.reward_description || 'Set up your first reward below'}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-medium text-gray-900">{business.visit_goal} Visits</h3>
                                <p className="text-sm text-gray-600 mt-1">Required to earn reward</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-medium text-gray-900">Engagement</h3>
                                <p className="text-sm text-gray-600 mt-1">Track customer loyalty</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reward Templates */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-100 to-pink-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-orange-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Reward Templates</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.icon}
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Templates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => selectTemplate(template)}
                                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group relative"
                                >
                                    {template.isPopular && (
                                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                            Popular
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-3">
                                        <div className={`${template.color} text-white p-2 rounded-lg flex-shrink-0`}>
                                            {template.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 group-hover:text-orange-700">
                                                {template.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {template.description}
                                            </p>
                                            <p className="text-xs text-orange-600 mt-2">
                                                After {template.visitGoal} visits
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Reward Configuration */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <Gift className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Custom Reward Configuration</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Visit Goal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Target className="w-4 h-4 inline mr-1" />
                                    Visits Required for Reward *
                                </label>
                                <select
                                    {...register('visit_goal', { valueAsNumber: true })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                                {errors.reward_description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reward_description.message}</p>
                                )}
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

                            {/* Save Button */}
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
                        </div>
                    </div>
                </form>

                {/* Tips Section */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        💡 Reward Tips:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <ul className="space-y-2">
                            <li>• Keep visit goals between 3-8 for best engagement</li>
                            <li>• Make rewards valuable but sustainable for your business</li>
                            <li>• Clear, specific descriptions work better than vague ones</li>
                        </ul>
                        <ul className="space-y-2">
                            <li>• Consider seasonal or limited-time rewards</li>
                            <li>• Test different visit goals to find what works</li>
                            <li>• Update rewards regularly to maintain interest</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}