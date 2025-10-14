'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    UserPlus,
    User,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle,
    Gift,
    QrCode,
    Loader,
    Star,
    Sparkles,
    Heart,
    Award
} from 'lucide-react'

const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Please enter a valid email address'),
})

type CustomerForm = z.infer<typeof customerSchema>

interface Business {
    id: string
    name: string
    reward_title: string
    reward_description: string
    visit_goal: number
    business_logo_url?: string
}

// Dynamic color themes based on business name/type
const getBusinessTheme = (businessName: string) => {
    const name = businessName.toLowerCase()

    // Restaurant/Food themes
    if (name.includes('restaurant') || name.includes('cafe') || name.includes('coffee') || name.includes('food') || name.includes('pizza') || name.includes('burger')) {
        return {
            primary: 'from-orange-500 to-red-500',
            secondary: 'from-orange-50 to-red-50',
            accent: 'bg-orange-100',
            button: 'bg-orange-600 hover:bg-orange-700',
            text: 'text-orange-900',
            icon: 'text-orange-600'
        }
    }

    // Beauty/Salon themes
    if (name.includes('salon') || name.includes('beauty') || name.includes('spa') || name.includes('nail') || name.includes('hair')) {
        return {
            primary: 'from-pink-500 to-purple-500',
            secondary: 'from-pink-50 to-purple-50',
            accent: 'bg-pink-100',
            button: 'bg-pink-600 hover:bg-pink-700',
            text: 'text-pink-900',
            icon: 'text-pink-600'
        }
    }

    // Health/Fitness themes
    if (name.includes('gym') || name.includes('fitness') || name.includes('health') || name.includes('medical') || name.includes('clinic')) {
        return {
            primary: 'from-green-500 to-teal-500',
            secondary: 'from-green-50 to-teal-50',
            accent: 'bg-green-100',
            button: 'bg-green-600 hover:bg-green-700',
            text: 'text-green-900',
            icon: 'text-green-600'
        }
    }

    // Retail/Shopping themes
    if (name.includes('store') || name.includes('shop') || name.includes('retail') || name.includes('boutique') || name.includes('market')) {
        return {
            primary: 'from-purple-500 to-indigo-500',
            secondary: 'from-purple-50 to-indigo-50',
            accent: 'bg-purple-100',
            button: 'bg-purple-600 hover:bg-purple-700',
            text: 'text-purple-900',
            icon: 'text-purple-600'
        }
    }

    // Default professional theme
    return {
        primary: 'from-blue-500 to-indigo-500',
        secondary: 'from-blue-50 to-indigo-50',
        accent: 'bg-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700',
        text: 'text-blue-900',
        icon: 'text-blue-600'
    }
}

function JoinBusinessContent() {
    const params = useParams()
    const businessId = params.businessId as string

    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [registeredCustomer, setRegisteredCustomer] = useState<any>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
    })

    useEffect(() => {
        const fetchBusiness = async () => {
            if (!businessId) {
                setError('No business ID provided')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/business/${businessId}`)
                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Business not found')
                } else {
                    setBusiness(result.business)
                }
            } catch (err) {
                setError('Failed to load business information')
            }
            setLoading(false)
        }

        fetchBusiness()
    }, [businessId])

    const onSubmit = async (data: CustomerForm) => {
        if (!business) return

        setSubmitting(true)
        setError('')

        try {
            // Register the customer with email functionality
            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: business.id,
                    name: data.name,
                    phone: data.phone,
                    email: data.email || null,
                    businessName: business.name,
                    rewardTitle: business.reward_title,
                    visitGoal: business.visit_goal
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Failed to register')
                setSubmitting(false)
                return
            }

            setRegisteredCustomer({
                ...result.customer,
                isExistingCustomer: result.isExistingCustomer || false
            })
            setSuccess(true)
            reset()
        } catch (err) {
            setError('An error occurred. Please try again.')
        }

        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (error && !business) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (success && registeredCustomer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {registeredCustomer.isExistingCustomer ? `Welcome back!` : `Welcome to ${business?.name}!`}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {registeredCustomer.isExistingCustomer
                                ? "Welcome back! Your visit has been recorded and your information updated."
                                : "🎉 Congratulations! You've successfully joined our loyalty program!"
                            }
                        </p>

                        {/* Show QR Code directly if available */}
                        {registeredCustomer.qr_code_url && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 text-center">Your Personal QR Code</h3>
                                <div className="flex justify-center mb-3">
                                    <img
                                        src={registeredCustomer.qr_code_url}
                                        alt="Your QR Code"
                                        className="w-32 h-32 border-2 border-gray-200 rounded-lg"
                                    />
                                </div>
                                <p className="text-xs text-gray-600 text-center">
                                    📱 Save this QR code to your phone and show it on each visit!
                                </p>
                            </div>
                        )}

                        <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                            <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                Check Your Email!
                            </h3>
                            <ul className="text-sm text-green-800 space-y-1 text-left">
                                <li>• We've sent your personal QR code to your email</li>
                                <li>• Save the QR code to your phone</li>
                                <li>• Show your QR code on each visit to earn points</li>
                                <li>• Get your {business?.reward_title} after {business?.visit_goal} visits!</li>
                            </ul>
                        </div>

                        <div className="bg-teal-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <Gift className="w-5 h-5 text-teal-600 mr-2" />
                                <span className="font-medium text-teal-900">Current Progress</span>
                            </div>
                            <p className="text-teal-800">{registeredCustomer.visits} of {business?.visit_goal} visits completed</p>
                            <div className="w-full bg-teal-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(registeredCustomer.visits / (business?.visit_goal || 5)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <a
                                href={`/customer-qr?id=${registeredCustomer.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <QrCode className="w-4 h-4" />
                                <span>View Your QR Code</span>
                            </a>
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Thank you for joining our loyalty program!
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            {business?.business_logo_url ? (
                                <img
                                    src={business.business_logo_url}
                                    alt={business.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">
                                        {business?.name?.charAt(0) || 'B'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Join {business?.name}</h1>
                        <p className="text-blue-100">Start earning rewards with every visit!</p>
                    </div>

                    {/* Reward Info */}
                    <div className="px-8 py-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                                    <Gift className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{business?.reward_title}</h3>
                                    <p className="text-sm text-gray-600">After {business?.visit_goal} visits</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700">{business?.reward_description}</p>

                            {/* Star rating visual */}
                            <div className="flex justify-center mt-3 space-x-1">
                                {Array.from({ length: business?.visit_goal || 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Your Name *
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number *
                                </label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address *
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    📧 Your personal QR code will be sent to this email
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Joining...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>Join Loyalty Program</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                <p className="text-xs text-blue-700 font-medium mb-1">
                                    📧 Your QR Code Will Be Emailed To You
                                </p>
                                <p className="text-xs text-blue-600">
                                    Save it to your phone and show it on each visit to earn rewards!
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                                By joining, you agree to receive loyalty program updates
                            </p>
                            <p className="text-xs text-gray-400">
                                Already a member? Enter your info to update and get your QR code
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function JoinBusinessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <JoinBusinessContent />
        </Suspense>
    )
}