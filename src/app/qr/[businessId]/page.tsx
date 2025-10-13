'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Business } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Star, Phone, Mail, User, CheckCircle } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

type CustomerForm = z.infer<typeof customerSchema>

export default function QRLandingPage() {
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [step, setStep] = useState<'preview' | 'register' | 'success'>('preview')
    const [submitting, setSubmitting] = useState(false)

    const params = useParams()
    const businessId = params.businessId as string

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
    })

    useEffect(() => {
        fetchBusiness()
    }, [businessId])

    const fetchBusiness = async () => {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', businessId)
                .single()

            if (data && !error) {
                setBusiness(data)
            } else {
                setError('Business not found')
            }
        } catch (err) {
            setError('Failed to load business information')
        }
        setLoading(false)
    }

    const onSubmit = async (data: CustomerForm) => {
        if (!business) return

        setSubmitting(true)
        setError('')

        try {
            // Check if customer already exists
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('*')
                .eq('phone', data.phone)
                .eq('business_id', business.id)
                .single()

            if (existingCustomer) {
                setError('You are already registered! Please scan your QR code for visits.')
                setSubmitting(false)
                return
            }

            // Create customer record
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    name: data.name,
                    phone: data.phone,
                    email: data.email || null,
                    email_confirmed: false,
                    visits: 0, // Start with 0, will be incremented on first scan
                    business_id: business.id,
                    qr_code_url: '', // Will be updated after QR generation
                })
                .select()
                .single()

            if (customerError || !newCustomer) {
                throw new Error(customerError?.message || 'Failed to register')
            }

            // Register customer and send QR code via API
            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: business.id,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    businessName: business.name,
                    rewardTitle: business.reward_title,
                    visitGoal: business.visit_goal,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to register customer')
            }

            setStep('success')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
        }

        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (error && !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (!business) return null

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {business.name}!</h2>
                        <p className="text-gray-600 mb-6">
                            You've been registered for our loyalty program. Your QR code has been sent to your phone/email.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                            <ol className="text-sm text-blue-800 space-y-1 text-left">
                                <li>1. Show your QR code when you visit</li>
                                <li>2. Earn points with each visit</li>
                                <li>3. Get rewards after {business.visit_goal} visits</li>
                            </ol>
                        </div>
                        <button
                            onClick={() => window.close()}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Business Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white text-center">
                        <div className="flex items-center justify-center mb-4">
                            {business.business_logo_url ? (
                                <img
                                    src={business.business_logo_url}
                                    alt={business.name}
                                    className="w-16 h-16 rounded-full border-4 border-white"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white">
                                    <span className="text-2xl font-bold">
                                        {business.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold mb-2">{business.name}</h1>
                        <p className="text-blue-100">Loyalty Program</p>
                    </div>

                    {step === 'preview' ? (
                        <div className="p-6">
                            {/* Reward Preview */}
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gift className="w-10 h-10 text-yellow-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{business.reward_title}</h2>
                                <p className="text-gray-600 mb-4">{business.reward_description}</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-center mb-2">
                                        <Star className="w-5 h-5 text-blue-600 mr-2" />
                                        <span className="font-semibold text-gray-900">Visit Goal</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">{business.visit_goal}</p>
                                    <p className="text-sm text-gray-600">visits to earn reward</p>
                                </div>
                            </div>

                            {/* How it works */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-xs font-bold text-blue-600">1</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Register with your details</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-xs font-bold text-blue-600">2</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Get your personal QR code</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-xs font-bold text-blue-600">3</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Show QR code on each visit to earn points</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-xs font-bold text-blue-600">4</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Get rewarded after {business.visit_goal} visits!</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('register')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Join Loyalty Program
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Join Our Loyalty Program</h2>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Full Name *
                                    </label>
                                    <input
                                        {...register('name')}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Phone Number *
                                    </label>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your phone number"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your email address"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('preview')}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {submitting ? 'Registering...' : 'Register'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}