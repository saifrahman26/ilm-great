'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Customer, Business } from '@/lib/supabase'

import {
    CheckCircle,
    Gift,
    User,
    AlertCircle,
    QrCode,
    UserPlus
} from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function ScanPage() {
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [visitRecorded, setVisitRecorded] = useState(false)
    const [rewardEarned, setRewardEarned] = useState(false)

    const searchParams = useSearchParams()
    const customerId = searchParams.get('customer')
    const qrData = searchParams.get('qr_data')

    const fetchCustomerAndRecordVisit = useCallback(async () => {
        if (!customerId && !qrData) return

        try {
            // Use API endpoint to record visit and get updated data
            const requestBody = customerId
                ? { customerId: customerId }
                : { qrData: qrData }

            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to record visit')
            }

            // Update state with the response data
            setCustomer(result.customer)
            setBusiness(result.business)
            setVisitRecorded(result.visitRecorded)
            setRewardEarned(result.rewardEarned)

        } catch (err) {
            console.error('Error recording visit:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        }

        setLoading(false)
    }, [customerId, qrData])

    useEffect(() => {
        if (customerId || qrData) {
            fetchCustomerAndRecordVisit()
        } else {
            setError('No customer QR code detected. Please scan a customer\'s personal QR code to record a visit.')
            setLoading(false)
        }
    }, [customerId, qrData, fetchCustomerAndRecordVisit])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Processing QR code...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code Error</h2>
                        <p className="text-gray-600 mb-8">{error}</p>

                        <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
                            <h3 className="font-medium text-blue-900 mb-3">How to use QR scanning:</h3>
                            <ol className="text-sm text-blue-800 space-y-2">
                                <li className="flex items-start">
                                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                                    Customer must register first and receive their personal QR code
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                                    Customer shows their QR code at your business
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                                    Scan the customer's QR code to record their visit
                                </li>
                            </ol>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href="/register"
                                className="flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Register Customer
                            </Link>
                            <Link
                                href="/manual-visit"
                                className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Manual Visit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Not Found</h2>
                        <p className="text-gray-600 mb-8">The scanned QR code doesn't match any registered customer.</p>
                        <Link
                            href="/register"
                            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                        >
                            Register New Customer
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-md mx-auto">
                {/* Simple Success Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${rewardEarned ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                        {rewardEarned ? (
                            <Gift className="w-10 h-10 text-yellow-600" />
                        ) : (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {rewardEarned ? '🎉 Reward Earned!' : '✅ Visit Recorded!'}
                    </h2>

                    <p className="text-gray-600 mb-8">
                        {rewardEarned
                            ? `${customer.name} earned a reward!`
                            : `Visit recorded for ${customer.name}`
                        }
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
                        >
                            <QrCode className="w-4 h-4 mr-2" />
                            Scan Another QR Code
                        </button>
                        <Link
                            href="/dashboard"
                            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors block text-center"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}