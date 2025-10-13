'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Mail, Phone, User, CheckCircle, Loader } from 'lucide-react'

const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address'),
})

type CustomerForm = z.infer<typeof customerSchema>

interface Business {
    id: string
    name: string
    email: string
    reward_title: string
    reward_description: string
    visit_goal: number
    business_logo_url?: string
}

export default function JoinLoyaltyPage() {
    const params = useParams()
    const businessId = params.businessId as string

    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

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
            console.log('Fetching business with ID:', businessId)

            try {
                const response = await fetch(`/api/business/${businessId}`)
                const result = await response.json()

                console.log('Business API result:', result)

                if (!response.ok) {
                    setError(result.error || 'Business not found')
                } else {
                    setBusiness(result.business)
                    console.log('Business loaded successfully:', result.business.name)
                }
            } catch (err) {
                console.error('Business fetch exception:', err)
                setError('Failed to load business information')
            }
            setLoading(false)
        }

        if (businessId) {
            fetchBusiness()
        } else {
            console.log('No business ID provided')
            setLoading(false)
        }
    }, [businessId])

    const onSubmit = async (data: CustomerForm) => {
        if (!business) return

        setSubmitting(true)
        setError('')

        try {
            // Register the customer (API will handle duplicate check)
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
                throw new Error(result.error || 'Failed to register customer')
            }

            setSuccess(true)
            reset()
        } catch (err: any) {
            setError(err.message || 'Failed to register. Please try again.')
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
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-600 mb-4">The loyalty program you're trying to join doesn't exist or is no longer available.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                        <h3 className="font-medium text-blue-900 mb-2">Possible reasons:</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>• The business hasn't set up their loyalty program yet</li>
                            <li>• The QR code or link is outdated</li>
                            <li>• There may be a temporary system issue</li>
                        </ul>
                        <p className="text-blue-700 text-sm mt-3">
                            Please contact the business directly to join their loyalty program.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="max-w-md mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {business?.name}!</h2>
                        <p className="text-gray-600 mb-6">
                            You've successfully joined our loyalty program! Your personal QR code has been sent to you.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                            <ul className="text-sm text-blue-800 space-y-1 text-left">
                                <li>• Check your email/SMS for your QR code</li>
                                <li>• Show your QR code on each visit</li>
                                <li>• Earn rewards after {business?.visit_goal} visits</li>
                                <li>• Enjoy your {business?.reward_title}!</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => {
                                setSuccess(false)
                                reset()
                            }}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Register Another Customer
                        </button>
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
                        {business?.business_logo_url ? (
                            <img
                                src={business.business_logo_url}
                                alt={business.name}
                                className="w-16 h-16 rounded-full mx-auto mb-4 bg-white p-2"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="w-8 h-8 text-blue-600" />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-white mb-2">Join {business?.name}</h1>
                        <p className="text-blue-100">Register for our loyalty program</p>
                    </div>

                    {/* Reward Info */}
                    <div className="px-8 py-6 bg-gray-50 border-b">
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-900 mb-2">{business?.reward_title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{business?.reward_description}</p>
                            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Earn rewards after {business?.visit_goal} visits
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Customer Name *
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
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Your QR code will be sent to this email address
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
                                        <span>Registering...</span>
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
                            <p className="text-xs text-gray-500">
                                Your personal QR code will be sent to your email
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}