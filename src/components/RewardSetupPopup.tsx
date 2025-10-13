'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { SetupStatusTracker } from '@/lib/setupStatus'
import {
    Gift,
    Target,
    Award,
    X,
    Save,
    ArrowRight,
    Sparkles,
    CheckCircle
} from 'lucide-react'

const rewardSchema = z.object({
    reward_title: z.string().min(3, 'Reward title must be at least 3 characters'),
    reward_description: z.string().min(10, 'Reward description must be at least 10 characters'),
    visit_goal: z.number().min(1, 'Visit goal must be at least 1').max(20, 'Visit goal cannot exceed 20'),
})

type RewardForm = z.infer<typeof rewardSchema>

interface RewardSetupPopupProps {
    isOpen: boolean
    onClose: () => void
    onComplete: () => void
    businessId: string
    businessName: string
}

export default function RewardSetupPopup({
    isOpen,
    onClose,
    onComplete,
    businessId,
    businessName
}: RewardSetupPopupProps) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState(1)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<RewardForm>({
        resolver: zodResolver(rewardSchema),
        defaultValues: {
            reward_title: '',
            reward_description: '',
            visit_goal: 5
        }
    })

    const rewardExamples = [
        { title: 'Free Coffee', description: 'Get a free coffee on us!', visits: 5 },
        { title: '20% Off', description: 'Get 20% off your next purchase', visits: 3 },
        { title: 'Free Dessert', description: 'Choose any dessert from our menu', visits: 4 },
        { title: 'Buy 1 Get 1 Free', description: 'Buy one item and get another free', visits: 6 },
        { title: 'Free Appetizer', description: 'Start your meal with a free appetizer', visits: 4 },
        { title: '$10 Off', description: 'Get $10 off your next order', visits: 8 }
    ]

    const selectExample = (example: typeof rewardExamples[0]) => {
        setValue('reward_title', example.title)
        setValue('reward_description', example.description)
        setValue('visit_goal', example.visits)
        setStep(2)
    }

    const onSubmit = async (data: RewardForm) => {
        setSaving(true)
        setError('')

        try {
            const { error: updateError } = await supabase
                .from('businesses')
                .update({
                    reward_title: data.reward_title,
                    reward_description: data.reward_description,
                    visit_goal: data.visit_goal,
                })
                .eq('id', businessId)

            if (updateError) {
                throw new Error(updateError.message)
            }

            // Mark setup as complete
            await SetupStatusTracker.markRewardSetupComplete(businessId)

            onComplete()
        } catch (err) {
            console.error('Reward setup error:', err)
            setError(err instanceof Error ? err.message : 'Failed to save reward settings')
        }

        setSaving(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500 border border-gray-100">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 px-8 py-8 rounded-t-3xl relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200 hover:scale-110"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                            🎉 Welcome to LoyalLink!
                        </h2>
                        <p className="text-purple-100 text-lg">
                            Let's set up your first loyalty reward for <strong className="text-white">{businessName}</strong>
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        /* Enhanced Step 1: Choose Example or Custom */
                        <div className="space-y-8">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Choose Your Reward Type
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    Pick from popular examples or create your own custom reward
                                </p>
                            </div>

                            {/* Enhanced Popular Examples */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-6 flex items-center text-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                        <Gift className="w-4 h-4 text-white" />
                                    </div>
                                    Popular Reward Ideas
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rewardExamples.map((example, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectExample(example)}
                                            className="text-left p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group hover:shadow-lg hover:scale-105"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                                                            <Award className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <h5 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                            {example.title}
                                                        </h5>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                                        {example.description}
                                                    </p>
                                                    <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                        <Target className="w-3 h-3 mr-1" />
                                                        After {example.visits} visits
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200 mt-2" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Enhanced Custom Option */}
                            <div className="border-t border-gray-200 pt-8">
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group hover:shadow-lg"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
                                            <Award className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                        </div>
                                        <h5 className="font-semibold text-gray-900 group-hover:text-purple-700 text-lg mb-2 transition-colors">
                                            Create Custom Reward
                                        </h5>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Design your own unique loyalty reward with custom details
                                        </p>
                                        <div className="mt-4 inline-flex items-center text-purple-600 text-sm font-medium">
                                            <Sparkles className="w-4 h-4 mr-1" />
                                            Get Creative
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Enhanced Skip Option */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <button
                                    onClick={onComplete}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                    Skip for now - I'll set this up later
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Enhanced Step 2: Customize Reward */
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Customize Your Reward
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    Fine-tune the details of your loyalty reward
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium shadow-sm">
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                            <X className="w-3 h-3 text-white" />
                                        </div>
                                        {error}
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Visit Goal */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                        <Target className="w-4 h-4 text-white" />
                                    </div>
                                    Visits Required for Reward *
                                </label>
                                <select
                                    {...register('visit_goal', { valueAsNumber: true })}
                                    className="w-full px-4 py-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white shadow-sm text-gray-900 font-medium transition-all duration-200"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                                        <option key={num} value={num}>
                                            {num} visit{num > 1 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.visit_goal && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.visit_goal.message}</p>
                                )}
                            </div>

                            {/* Enhanced Reward Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                        <Award className="w-4 h-4 text-white" />
                                    </div>
                                    Reward Title *
                                </label>
                                <input
                                    {...register('reward_title')}
                                    type="text"
                                    placeholder="e.g., Free Coffee, 20% Off, Free Dessert"
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white shadow-sm text-gray-900 placeholder-gray-500 font-medium transition-all duration-200 hover:border-gray-300"
                                />
                                {errors.reward_title && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.reward_title.message}</p>
                                )}
                            </div>

                            {/* Enhanced Reward Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                        <Gift className="w-4 h-4 text-white" />
                                    </div>
                                    Reward Description *
                                </label>
                                <textarea
                                    {...register('reward_description')}
                                    rows={4}
                                    placeholder="Describe what customers get when they earn this reward..."
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white shadow-sm text-gray-900 placeholder-gray-500 font-medium transition-all duration-200 hover:border-gray-300 resize-none"
                                />
                                {errors.reward_description && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.reward_description.message}</p>
                                )}
                            </div>

                            {/* Enhanced Preview */}
                            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-inner">
                                <h4 className="font-bold text-purple-900 mb-4 flex items-center text-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                    Live Preview
                                </h4>
                                <div className="bg-white rounded-2xl p-6 border-2 border-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                                            <Gift className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 text-lg block">
                                                {watch('reward_title') || 'Your Reward Title'}
                                            </span>
                                            <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mt-1">
                                                <Target className="w-3 h-3 mr-1" />
                                                After {watch('visit_goal') || 5} visits
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        {watch('reward_description') || 'Your reward description will appear here...'}
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold hover:scale-105"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:via-pink-700 hover:to-red-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Save & Continue</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Enhanced Skip Option */}
                            <div className="text-center pt-4">
                                <button
                                    type="button"
                                    onClick={onComplete}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                >
                                    Skip - I'll set this up later in settings
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}