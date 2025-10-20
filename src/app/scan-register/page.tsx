'use client'

import { useState, useEffect } from 'react'

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
    Loader
} from 'lucide-react'
import PhoneInput from '@/components/PhoneInput'

const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
})

type CustomerForm = z.infer<typeof customerSchema>

function ScanRegisterContent() {
    const [businessId, setBusinessId] = useState<string | null>(null)

    // Get business ID from URL without Suspense issues
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            setBusinessId(params.get('business'))
        }
    }, [])

    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [registeredCustomer, setRegisteredCustomer] = useState<any>(null)
    const [businessName, setBusinessName] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
    })

    // No more business fetching - just handle registration directly

    const onSubmit = async (data: CustomerForm) => {
        if (!businessId) {
            setError('No business ID provided')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            // Register the customer and record the visit - let the API handle business lookup
            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: businessId,
                    name: data.name,
                    phone: data.phone,
                    email: data.email || null,
                    businessName: 'Business', // Fallback name
                    rewardTitle: 'Loyalty Reward',
                    visitGoal: 5
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Failed to register')
                setSubmitting(false)
                return
            }

            // Extract business info from response
            setBusinessName(result.businessName || 'Business')

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

    // Show error only if no business ID
    if (!businessId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid QR Code</h2>
                    <p className="text-gray-600">This QR code doesn't contain valid business information.</p>
                </div>
            </div>
        )
    }

    if (success && registeredCustomer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="max-w-md mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {registeredCustomer.isExistingCustomer ? `Welcome back to ${businessName}!` : `Welcome to ${businessName}!`}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {registeredCustomer.isExistingCustomer
                                ? "Your visit has been recorded and your information has been updated!"
                                : "You've successfully joined our loyalty program and your visit has been recorded!"
                            }
                        </p>

                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                            <ul className="text-sm text-blue-800 space-y-1 text-left">
                                <li>• Your QR code has been sent to your email</li>
                                <li>• Show your QR code on each visit</li>
                                <li>• Earn rewards after 5 visits</li>
                                <li>• Enjoy your loyalty rewards!</li>
                            </ul>
                        </div>

                        <div className="bg-teal-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <Gift className="w-5 h-5 text-teal-600 mr-2" />
                                <span className="font-medium text-teal-900">Current Progress</span>
                            </div>
                            <p className="text-teal-800">{registeredCustomer.visits} of 5 visits completed</p>
                            <div className="w-full bg-teal-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(registeredCustomer.visits / 5) * 100}%` }}
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
                            <QrCode className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Join Our Loyalty Program</h1>
                        <p className="text-blue-100">Complete your registration to start earning rewards</p>
                    </div>

                    {/* Reward Info */}
                    <div className="px-8 py-6 bg-gray-50 border-b">
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-900 mb-2">Loyalty Rewards</h3>
                            <p className="text-sm text-gray-600 mb-3">Earn points with every visit and unlock exclusive rewards</p>
                            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Earn rewards after 5 visits
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
                                <PhoneInput
                                    value={watch('phone') || '+1'}
                                    onChange={(value) => {
                                        reset({
                                            ...watch(),
                                            phone: value
                                        })
                                    }}
                                    placeholder="1234567890"
                                    className="text-gray-900"
                                    error={errors.phone?.message}
                                    required
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
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>Register Visit</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 mb-2">
                                Your QR code will be sent to your email address
                            </p>
                            <p className="text-xs text-gray-400">
                                Already registered? Just enter your phone number to record your visit and optionally add/update your email
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ScanRegisterPage() {
    return <ScanRegisterContent />
}