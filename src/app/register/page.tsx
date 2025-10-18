'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/DashboardLayout'
import {
    UserPlus,
    User,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle,
    Gift,
    QrCode,
    Target
} from 'lucide-react'
import Link from 'next/link'

const customerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

type CustomerForm = z.infer<typeof customerSchema>

export default function RegisterPage() {
    const { user, business, loading } = useAuth()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [registeredCustomer, setRegisteredCustomer] = useState<any>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
    })

    const onSubmit = async (data: CustomerForm) => {
        if (!business) {
            setError('Business information not found')
            return
        }

        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            // Use the register-customer API to handle everything
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
                // Show specific message for existing customers
                if (result.isExistingCustomer && result.existingCustomer) {
                    const duplicateField = result.duplicateField === 'email' ? 'email address' : 'phone number'
                    const duplicateValue = result.duplicateField === 'email' ? result.existingCustomer.email : result.existingCustomer.phone

                    setError(`⚠️ Customer Already Registered!\n\n${result.existingCustomer.name} with ${duplicateField} "${duplicateValue}" already has ${result.existingCustomer.visits} visit(s).\n\nTo record a new visit:\n• Use the QR Scanner\n• Or go to Manual Visit page`)
                } else if (result.error && result.error.includes('already exists')) {
                    setError(`Customer already registered. Try using a different phone number or email.`)
                } else {
                    setError(result.message || result.error || 'Failed to register customer')
                }
                setSubmitting(false)
                return
            }

            setRegisteredCustomer(result.customer)
            if (result.customer.email) {
                setSuccess(`Customer ${data.name} registered successfully! QR code sent to ${result.customer.email}`)
            } else {
                setSuccess(`Customer ${data.name} registered successfully! No email provided - QR code not sent.`)
            }

            reset()
        } catch (err) {
            console.error('Registration error:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        }

        setSubmitting(false)
    }

    const resetForm = () => {
        setRegisteredCustomer(null)
        setSuccess('')
        setError('')
        reset()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
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
                    <p className="text-gray-600 mb-4">Please log in to register customers.</p>
                    <Link href="/login" className="bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    if (registeredCustomer && success) {
        return (
            <DashboardLayout title="Customer Registered" subtitle="New customer has been successfully added to your loyalty program">
                <div className="max-w-2xl mx-auto">
                    {/* Success Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                🎉 Customer Registered!
                            </h2>
                            <p className="text-gray-600">
                                {registeredCustomer.name} has been added to your loyalty program with their first visit counted
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Customer Name</p>
                                        <p className="font-medium text-gray-900">{registeredCustomer.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-medium text-gray-900">{registeredCustomer.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="font-medium text-gray-900">
                                            {registeredCustomer.email || 'Not provided'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Gift className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Current Progress</p>
                                        <p className="font-medium text-gray-900">1 of {business.visit_goal} visits</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Status */}
                        <div className={`p-6 rounded-lg border-2 mb-8 ${registeredCustomer.email
                            ? 'bg-green-50 border-green-200'
                            : 'bg-yellow-50 border-yellow-200'
                            }`}>
                            <div className="flex items-center">
                                <QrCode className={`w-6 h-6 mr-3 ${registeredCustomer.email
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                    }`} />
                                <div>
                                    <h3 className={`font-medium ${registeredCustomer.email
                                        ? 'text-green-900'
                                        : 'text-yellow-900'
                                        }`}>
                                        {registeredCustomer.email
                                            ? 'QR Code Sent Successfully'
                                            : 'QR Code Not Sent'
                                        }
                                    </h3>
                                    <p className={`text-sm ${registeredCustomer.email
                                        ? 'text-green-700'
                                        : 'text-yellow-700'
                                        }`}>
                                        {registeredCustomer.email
                                            ? `Customer will receive their personal QR code at ${registeredCustomer.email}`
                                            : 'No email provided - customer can still participate using phone number'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-teal-50 rounded-lg p-6 mb-8">
                            <h3 className="font-medium text-teal-900 mb-3">Next Steps:</h3>
                            <ul className="text-sm text-teal-800 space-y-2">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    First visit automatically recorded (1/{business.visit_goal})
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    They'll earn "{business.reward_title}" after {business.visit_goal - 1} more visits
                                </li>
                                {registeredCustomer.email && (
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        QR code email sent for easy check-ins
                                    </li>
                                )}
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    You can record visits manually or via QR scan
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={resetForm}
                                className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                Register Another Customer
                            </button>
                            <Link
                                href="/customers"
                                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors text-center"
                            >
                                View All Customers
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Add Customer" subtitle="Register a new customer to your loyalty program">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-teal-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Add New Customer</h2>
                        <p className="text-gray-600">Register a customer for your loyalty program</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('name')}
                                    type="text"
                                    placeholder="Enter customer name"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    placeholder="Enter phone number"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Enter email address"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Required to receive QR code and visit notifications
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Registering...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>Register Customer</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Program Info */}
                    <div className="mt-8 bg-gray-50 rounded-lg p-6">
                        <h3 className="font-medium text-gray-900 mb-3">Loyalty Program Details</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                                <Gift className="w-4 h-4 mr-2 text-teal-600" />
                                <span>Reward: {business.reward_title}</span>
                            </div>
                            <div className="flex items-center">
                                <Target className="w-4 h-4 mr-2 text-teal-600" />
                                <span>Visits needed: {business.visit_goal}</span>
                            </div>
                            <div className="flex items-center">
                                <QrCode className="w-4 h-4 mr-2 text-teal-600" />
                                <span>QR code sent via email (if provided)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}