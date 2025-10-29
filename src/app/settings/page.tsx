'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/DashboardLayout'
import {
    Settings,
    Gift,
    Building,
    Mail,
    Phone,
    Save,
    Upload,
    Camera,
    Target,
    Award,
    Shield,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import PhoneInput from '@/components/PhoneInput'
import { CardSkeleton } from '@/components/LoadingSkeleton'

const businessSettingsSchema = z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    reward_title: z.string().min(3, 'Reward title must be at least 3 characters'),
    reward_description: z.string().min(10, 'Reward description must be at least 10 characters'),
    visit_goal: z.number().min(1, 'Visit goal must be at least 1').max(20, 'Visit goal cannot exceed 20'),
    google_review_link: z.string().url('Please enter a valid Google Review URL').optional().or(z.literal('')),
})

type BusinessSettingsForm = z.infer<typeof businessSettingsSchema>

export default function SettingsPage() {
    const { user, business, loading } = useAuth()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<BusinessSettingsForm>({
        resolver: zodResolver(businessSettingsSchema),
    })

    // Load business data into form
    useEffect(() => {
        if (business) {
            setValue('name', business.name)
            setValue('email', business.email)
            setValue('phone', business.phone)
            setValue('reward_title', business.reward_title)
            setValue('reward_description', business.reward_description)
            setValue('visit_goal', business.visit_goal)
            setValue('google_review_link', business.google_review_link || '')

            if (business.business_logo_url) {
                setLogoPreview(business.business_logo_url)
            }
        }
    }, [business, setValue])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data: BusinessSettingsForm) => {
        if (!business) return

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            let logoUrl = business.business_logo_url

            // Upload logo if changed
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop()
                const fileName = `${business.id}-logo.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('business-logos')
                    .upload(fileName, logoFile, { upsert: true })

                if (uploadError) {
                    throw new Error('Failed to upload logo')
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('business-logos')
                    .getPublicUrl(fileName)

                logoUrl = publicUrl
            }

            // Update business settings
            const { error: updateError } = await supabase
                .from('businesses')
                .update({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    reward_title: data.reward_title,
                    reward_description: data.reward_description,
                    visit_goal: data.visit_goal,
                    business_logo_url: logoUrl,
                    google_review_link: data.google_review_link || null,
                })
                .eq('id', business.id)

            if (updateError) {
                throw new Error(updateError.message)
            }

            setSuccess('Settings updated successfully!')

            // Refresh the page to update the auth context
            setTimeout(() => {
                window.location.reload()
            }, 1500)

        } catch (err) {
            console.error('Settings update error:', err)
            setError(err instanceof Error ? err.message : 'Failed to update settings')
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <DashboardLayout
                title="Settings"
                subtitle="Manage your business and loyalty program settings"
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
                    <p className="text-gray-600 mb-4">Please log in to access settings.</p>
                    <Link href="/login" className="bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout
            title="Settings"
            subtitle="Manage your business and loyalty program settings"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-red-800 font-medium">Error</h4>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs">✓</span>
                        </div>
                        <div>
                            <h4 className="text-green-800 font-medium">Success</h4>
                            <p className="text-green-700 text-sm mt-1">{success}</p>
                        </div>
                    </div>
                )}

                {/* Business Information Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <Building className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Business Information</h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Business Logo
                            </label>
                            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors block"
                                    >
                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Click to upload logo
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG up to 2MB
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Name *
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 focus:scale-105"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email Address *
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 focus:scale-105"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Phone Number *
                                </label>
                                <PhoneInput
                                    value={watch('phone') || '+1'}
                                    onChange={(value) => {
                                        setValue('phone', value)
                                    }}
                                    placeholder="1234567890"
                                    className="text-gray-900"
                                    error={errors.phone?.message}
                                    required
                                />
                            </div>
                        </div>

                        {/* Google Review Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Award className="w-4 h-4 inline mr-1" />
                                Google Review Link
                                <span className="text-xs text-gray-500 ml-2">(Optional but recommended)</span>
                            </label>
                            <input
                                {...register('google_review_link')}
                                type="url"
                                placeholder="https://g.page/r/your-business-id/review"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 focus:scale-105"
                            />
                            {errors.google_review_link && (
                                <p className="mt-1 text-sm text-red-600">{errors.google_review_link.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Customers will be redirected here after registration to leave reviews.
                                <a href="https://support.google.com/business/answer/7035772" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 ml-1">
                                    Learn how to get your Google Review link →
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Reward Templates */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <Gift className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Quick Reward Templates</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <p className="text-gray-600 mb-4">
                            Choose from popular reward templates to quickly set up your loyalty program:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { title: 'Free Coffee', description: 'Get a free coffee on us!', visits: 5 },
                                { title: '20% Off', description: 'Get 20% off your next purchase', visits: 3 },
                                { title: 'Free Dessert', description: 'Choose any dessert from our menu', visits: 4 },
                                { title: 'Buy 1 Get 1 Free', description: 'Buy one item and get another free', visits: 6 },
                                { title: '$10 Off', description: 'Get $10 off your next order', visits: 8 },
                                { title: 'Free Appetizer', description: 'Start your meal with a free appetizer', visits: 4 }
                            ].map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setValue('reward_title', template.title)
                                        setValue('reward_description', template.description)
                                        setValue('visit_goal', template.visits)
                                    }}
                                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                                >
                                    <h4 className="font-medium text-gray-900 group-hover:text-orange-700 mb-1">
                                        {template.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {template.description}
                                    </p>
                                    <p className="text-xs text-orange-600">
                                        After {template.visits} visits
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reward Program Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <Gift className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Custom Reward Program</h2>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 transition-all duration-200 hover:border-gray-400 focus:scale-105"
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
                            <p className="mt-1 text-xs text-gray-500">
                                How many visits customers need to earn a reward
                            </p>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 focus:scale-105"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400 focus:scale-105"
                            />
                            {errors.reward_description && (
                                <p className="mt-1 text-sm text-red-600">{errors.reward_description.message}</p>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Reward Preview:</h4>
                            <div className="bg-white rounded-lg p-3 border">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Gift className="w-4 h-4 text-purple-600" />
                                    <span className="font-medium text-gray-900">
                                        {watch('reward_title') || 'Your Reward Title'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {watch('reward_description') || 'Your reward description will appear here...'}
                                </p>
                                <p className="text-xs text-purple-600 mt-2">
                                    Earned after {watch('visit_goal') || 5} visits
                                </p>
                            </div>
                        </div>

                        {/* Reward Tips */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">💡 Reward Tips:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Keep visit goals between 3-8 for best engagement</li>
                                <li>• Make rewards valuable but sustainable for your business</li>
                                <li>• Clear, specific descriptions work better than vague ones</li>
                                <li>• Consider seasonal or limited-time rewards to create urgency</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Security & Privacy Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-white" />
                            <h2 className="text-lg font-semibold text-white">Security & Privacy</h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Data Protection</h4>
                                <p className="text-sm text-gray-600">All customer data is encrypted and securely stored</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Privacy Compliance</h4>
                                <p className="text-sm text-gray-600">GDPR and CCPA compliant data handling</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-start space-x-2">
                                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-900">Account Security</h4>
                                    <p className="text-sm text-yellow-800 mt-1">
                                        To change your password or update security settings, please contact support.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    )
}