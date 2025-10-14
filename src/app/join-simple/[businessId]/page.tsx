'use client'

import { useEffect, useState } from 'react'
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
    QrCode,
    Loader,
    Download
} from 'lucide-react'

const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

type CustomerForm = z.infer<typeof customerSchema>

interface Business {
    id: string
    name: string
    reward_title: string
    visit_goal: number
}

interface Customer {
    id: string
    name: string
    phone: string
    email: string | null
    qr_code_url: string
    qr_data: string
}

export default function JoinSimplePage() {
    const params = useParams()
    const businessId = params.businessId as string

    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [customer, setCustomer] = useState<Customer | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
    })

    useEffect(() => {
        const fetchBusiness = async () => {
            if (!businessId) return

            try {
                const response = await fetch(`/api/business/${businessId}`)
                const data = await response.json()

                if (response.ok && data.success) {
                    setBusiness(data.business)
                } else {
                    setError('Business not found')
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
                    visitGoal: business.visit_goal,
                }),
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setCustomer(result.customer)
                setSuccess(true)
            } else {
                setError(result.error || 'Registration failed')
            }
        } catch (err) {
            setError('Registration failed. Please try again.')
        }

        setSubmitting(false)
    }

    const downloadQR = () => {
        if (!customer?.qr_code_url) return

        const link = document.createElement('a')
        link.href = customer.qr_code_url
        link.download = `${customer.name}-loyalty-qr.png`
        link.click()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (error && !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (success && customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <div className="max-w-2xl mx-auto pt-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-8 py-6 text-center">
                            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-2">
                                🎉 Welcome to {business?.name}!
                            </h1>
                            <p className="text-green-100">
                                You've successfully joined our loyalty program
                            </p>
                        </div>

                        {/* QR Code Section */}
                        <div className="p-8 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Your Personal QR Code
                            </h2>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                <div className="bg-white rounded-xl p-4 inline-block shadow-sm">
                                    <img
                                        src={customer.qr_code_url}
                                        alt="Your QR Code"
                                        className="w-48 h-48 mx-auto"
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-4">
                                    📱 Show this QR code when you visit {business?.name}
                                </p>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-900 mb-2">Your Details:</h3>
                                <p className="text-blue-800"><strong>Name:</strong> {customer.name}</p>
                                <p className="text-blue-800"><strong>Phone:</strong> {customer.phone}</p>
                                {customer.email && (
                                    <p className="text-blue-800"><strong>Email:</strong> {customer.email}</p>
                                )}
                            </div>

                            {/* Reward Info */}
                            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-yellow-900 mb-2">🎁 Reward Program:</h3>
                                <p className="text-yellow-800">
                                    <strong>{business?.reward_title}</strong>
                                </p>
                                <p className="text-yellow-700 text-sm">
                                    Earn rewards after {business?.visit_goal} visits
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={downloadQR}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download QR Code</span>
                                </button>

                                <p className="text-xs text-gray-500">
                                    💡 Tip: Take a screenshot or save this QR code to your phone
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-md mx-auto pt-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
                        <QrCode className="w-12 h-12 text-white mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Join {business?.name}
                        </h1>
                        <p className="text-blue-100">
                            Get your loyalty QR code instantly
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    Email Address (Optional)
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
                                        <span>Join & Get QR Code</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Your QR code will be shown immediately after registration
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}