'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/DashboardLayout'
import {
    User,
    Phone,
    Mail,
    Search,
    CheckCircle,
    Gift,
    UserCheck,
    AlertCircle,
    Camera,
    UserPlus
} from 'lucide-react'
import Link from 'next/link'

const visitSchema = z.object({
    identifier: z.string().min(1, 'Please enter email or phone number'),
})

type VisitForm = z.infer<typeof visitSchema>

interface Customer {
    id: string
    name: string
    phone: string
    email: string
    visits: number
    points: number
    business_id: string
}

interface Business {
    id: string
    name: string
    reward_title: string
    reward_description: string
    visit_goal: number
}

export default function ManualVisitPage() {
    const { user, business, loading } = useAuth()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [businessData, setBusinessData] = useState<Business | null>(null)
    const [searching, setSearching] = useState(false)
    const [recording, setRecording] = useState(false)
    const [visitRecorded, setVisitRecorded] = useState(false)
    const [rewardEarned, setRewardEarned] = useState(false)
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<VisitForm>({
        resolver: zodResolver(visitSchema),
    })

    const searchCustomer = async (data: VisitForm) => {
        if (!business) return

        setSearching(true)
        setError('')
        setCustomer(null)

        try {
            const response = await fetch('/api/find-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessId: business.id,
                    identifier: data.identifier.trim()
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Customer not found')
            } else {
                setCustomer(result.customer)
                setBusinessData(result.business)
            }
        } catch (err) {
            setError('Failed to search for customer')
        }

        setSearching(false)
    }

    const recordVisit = async () => {
        if (!customer) return

        setRecording(true)
        setError('')

        // More robust business ID resolution
        const actualBusinessId = String(business?.id || user?.id || customer.business_id || '').trim()

        console.log('📝 Manual visit - Recording visit:', {
            customerId: customer.id,
            actualBusinessId,
            businessFromAuth: business?.id,
            userIdFallback: user?.id,
            customerBusinessId: customer.business_id,
            allData: { business, user, customer }
        })

        if (!actualBusinessId) {
            setError('Unable to determine business ID. Please refresh the page and try again.')
            setRecording(false)
            return
        }

        try {
            const requestBody = {
                customerId: customer.id,
                businessId: actualBusinessId
            }

            console.log('📤 Manual visit request body:', requestBody)

            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })

            const result = await response.json()

            console.log('📥 Manual visit API response:', { status: response.status, result })

            if (!response.ok) {
                const errorMsg = result.error || 'Failed to record visit'
                console.error('❌ Manual visit API error:', { status: response.status, error: errorMsg, result })
                setError(`${errorMsg} (Status: ${response.status})`)
            } else {
                setCustomer(result.customer)
                setBusinessData(result.business)
                setVisitRecorded(true)
                setRewardEarned(result.rewardEarned)
            }
        } catch (err) {
            setError('Failed to record visit')
        }

        setRecording(false)
    }

    const resetForm = () => {
        setCustomer(null)
        setBusinessData(null)
        setVisitRecorded(false)
        setRewardEarned(false)
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

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to record visits.</p>
                    <Link href="/login" className="bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    if (visitRecorded && customer) {
        return (
            <DashboardLayout title="Visit Recorded" subtitle="Customer visit has been successfully recorded">
                <div className="max-w-2xl mx-auto">
                    {/* Success Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                        <div className="text-center mb-8">
                            <div className="relative inline-block">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${rewardEarned ? 'bg-yellow-100' : 'bg-green-100'
                                    }`}>
                                    {rewardEarned ? (
                                        <Gift className="w-10 h-10 text-yellow-600" />
                                    ) : (
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    )}
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">+1</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mt-4">
                                {rewardEarned ? '🎉 Reward Earned!' : '✅ Visit Recorded!'}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                {rewardEarned
                                    ? 'Congratulations! Customer earned a reward!'
                                    : `Visit recorded for ${customer.name}`
                                }
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{customer.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <UserCheck className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Total Visits</p>
                                        <p className="font-medium text-gray-900">{customer.visits} visits</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Gift className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Points</p>
                                        <p className="font-medium text-gray-900">{customer.points} points</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress to next reward</span>
                                <span>{customer.visits % (businessData?.visit_goal || 5)}/{businessData?.visit_goal || 5}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${((customer.visits % (businessData?.visit_goal || 5)) / (businessData?.visit_goal || 5)) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {(businessData?.visit_goal || 5) - (customer.visits % (businessData?.visit_goal || 5))} more visits to earn: {businessData?.reward_title || 'Free Coffee'}
                            </p>
                        </div>

                        {rewardEarned && businessData && (
                            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg mb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Gift className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-yellow-800 mb-2">
                                        🎉 {businessData.reward_title} Unlocked!
                                    </h3>
                                    <p className="text-yellow-700 mb-4">
                                        {businessData.reward_description}
                                    </p>
                                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-yellow-400">
                                        <p className="text-sm font-medium text-gray-800">
                                            Customer has earned their reward!
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Notification sent to customer
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={resetForm}
                                className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                Record Another Visit
                            </button>
                            <Link
                                href="/dashboard"
                                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors text-center"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Manual Visit" subtitle="Record a customer visit by searching their email or phone">
            <div className="max-w-2xl mx-auto">
                {!customer ? (
                    /* Enhanced Search Form */
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Search className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Find Customer</h2>
                            <p className="text-gray-600 text-lg">Search by email or phone number to record their visit</p>
                        </div>

                        <form onSubmit={handleSubmit(searchCustomer)} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email or Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('identifier')}
                                        type="text"
                                        placeholder="customer@email.com or +1234567890"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                                {errors.identifier && (
                                    <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={searching}
                                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                {searching ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        <span>Find Customer</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 mb-4">
                                Customer not registered yet?
                            </p>
                            <Link
                                href="/register"
                                className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Register New Customer
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Customer Found - Confirm Visit */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Found</h2>
                            <p className="text-gray-600">Confirm to record their visit</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{customer.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{customer.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <UserCheck className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Current Visits</p>
                                        <p className="font-medium text-gray-900">{customer.visits} visits</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={recordVisit}
                                disabled={recording}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {recording ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Recording Visit...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Record Visit</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setCustomer(null)}
                                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                            >
                                Search Different Customer
                            </button>
                        </div>
                    </div>
                )}

                {/* Alternative Options */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Other Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/scanner"
                            className="flex items-center justify-center bg-blue-50 text-blue-700 py-3 px-4 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Scan QR Code
                        </Link>
                        <Link
                            href="/register"
                            className="flex items-center justify-center bg-green-50 text-green-700 py-3 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register New Customer
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}