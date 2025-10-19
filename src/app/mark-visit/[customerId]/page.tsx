'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CheckCircle, User, Calendar, Award, Loader2 } from 'lucide-react'

export default function MarkVisitPage() {
    const params = useParams()
    const router = useRouter()
    const { user, business, loading: authLoading } = useAuth()
    const customerId = params.customerId as string

    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        console.log('🔍 Auth state:', {
            authLoading,
            hasUser: !!user,
            hasBusiness: !!business,
            businessId: business?.id,
            customerId
        })

        if (!authLoading && user && business) {
            loadCustomer()
        }
    }, [customerId, authLoading, user, business])

    const loadCustomer = async () => {
        try {
            setLoading(true)
            setError('')

            console.log('🔍 Loading customer:', { customerId, businessId: business?.id })

            const { data, error: fetchError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single()

            if (fetchError) throw fetchError

            console.log('✅ Customer loaded:', {
                id: data.id,
                name: data.name,
                business_id: data.business_id,
                matchesBusiness: data.business_id === business?.id
            })

            setCustomer(data)
        } catch (err) {
            console.error('❌ Error loading customer:', err)
            setError('Customer not found')
        } finally {
            setLoading(false)
        }
    }

    const markVisit = async () => {
        // More robust validation with string conversion
        const actualCustomerId = String(customer?.id || customerId || '').trim()
        const actualBusinessId = String(business?.id || user?.id || '').trim()

        // Temporary debugging - log all available data
        console.log('🔍 All available data:', {
            customer,
            business,
            user,
            customerId,
            'customer?.id': customer?.id,
            'business?.id': business?.id,
            'user?.id': user?.id,
            actualCustomerId,
            actualBusinessId
        })

        console.log('🔍 Validation check:', {
            customer: customer,
            business: business,
            user: user,
            actualCustomerId,
            actualBusinessId,
            customerId,
            businessFromAuth: business?.id,
            userIdFallback: user?.id
        })

        if (!actualCustomerId || actualCustomerId === '' || !actualBusinessId || actualBusinessId === '') {
            console.error('❌ Missing or empty required IDs:', {
                actualCustomerId,
                actualBusinessId,
                customerExists: !!customer,
                businessExists: !!business,
                userExists: !!user,
                customerIdLength: actualCustomerId?.length,
                businessIdLength: actualBusinessId?.length
            })
            setError(`Missing required data: Customer ID: "${actualCustomerId || 'missing'}", Business ID: "${actualBusinessId || 'missing'}"`)
            return
        }

        try {
            setMarking(true)
            setError('')

            console.log('📝 Marking visit with validated IDs:', {
                customerId: actualCustomerId,
                businessId: actualBusinessId,
                customerName: customer?.name,
                businessName: business?.name
            })

            const requestBody = {
                customerId: actualCustomerId,
                businessId: actualBusinessId
            }

            console.log('📤 Request body:', requestBody)
            console.log('📤 Request body stringified:', JSON.stringify(requestBody))

            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to record visit')
            }

            setSuccess(true)
            setCustomer(result.customer)

            // Show success message and redirect after 2 seconds
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)

        } catch (err) {
            console.error('Error marking visit:', err)
            setError(err instanceof Error ? err.message : 'Failed to record visit')
        } finally {
            setMarking(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading customer information...</p>
                </div>
            </div>
        )
    }

    if (error && !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Visit Recorded! 🎉</h2>
                    <p className="text-gray-600 mb-4">
                        <strong>{customer?.name}</strong> now has <strong>{customer?.visits}</strong> visit{customer?.visits !== 1 ? 's' : ''}
                    </p>
                    {customer?.visits >= (business?.visit_goal || 5) && (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 font-semibold">
                                🎁 Reward Earned!
                            </p>
                            <p className="text-yellow-700 text-sm">
                                Customer has reached the goal!
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        )
    }

    // Check if user is logged in AND is a business owner
    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Owner Access Only</h2>
                    <p className="text-gray-600 mb-6">
                        Only business owners can mark customer visits. Please ask the business owner to scan your QR code.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors w-full mb-3"
                    >
                        Business Owner Login
                    </button>
                    <p className="text-sm text-gray-500">
                        Are you a customer? Show this QR code to the business staff.
                    </p>
                </div>
            </div>
        )
    }

    // Verify the customer belongs to this business
    if (customer && customer.business_id !== business.id) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Wrong Business</h2>
                    <p className="text-gray-600 mb-6">
                        This customer belongs to a different business.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-6 md:p-8 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Record Customer Visit</h1>
                        <p className="text-purple-100 text-sm md:text-base">{business?.name}</p>
                    </div>
                </div>

                {/* Customer Info Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-6">
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{customer?.name}</h2>
                            <div className="space-y-1 text-gray-600">
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">📱</span>
                                    {customer?.phone}
                                </p>
                                {customer?.email && (
                                    <p className="flex items-center">
                                        <span className="font-medium mr-2">📧</span>
                                        {customer.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Visit Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-600 uppercase">Current</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-900">{customer?.visits || 0}</p>
                            <p className="text-sm text-blue-700">Total Visits</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <Award className="w-5 h-5 text-purple-600" />
                                <span className="text-xs font-semibold text-purple-600 uppercase">Goal</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-900">{business?.visit_goal || 5}</p>
                            <p className="text-sm text-purple-700">Visits Needed</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress to Reward</span>
                            <span className="font-semibold">
                                {Math.min(Math.round(((customer?.visits || 0) / (business?.visit_goal || 5)) * 100), 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(((customer?.visits || 0) / (business?.visit_goal || 5)) * 100, 100)}%`
                                }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            {(business?.visit_goal || 5) - (customer?.visits || 0) > 0
                                ? `${(business?.visit_goal || 5) - (customer?.visits || 0)} more visit${(business?.visit_goal || 5) - (customer?.visits || 0) === 1 ? '' : 's'} to earn reward`
                                : '🎉 Reward goal reached!'}
                        </p>
                    </div>

                    {/* Last Visit */}
                    {customer?.last_visit && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Last Visit:</span>{' '}
                                {new Date(customer.last_visit).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Debug Info (always show for now) */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                            <strong>Debug Info:</strong><br />
                            Business ID: {business?.id || 'null'}<br />
                            Customer ID: {customer?.id || 'null'}<br />
                            URL Customer ID: {customerId}<br />
                            User ID (fallback): {user?.id || 'null'}<br />
                            Final Customer ID: {customer?.id || customerId}<br />
                            Final Business ID: {business?.id || user?.id}<br />
                            Business Name: {business?.name || 'null'}<br />
                            Customer Name: {customer?.name || 'null'}<br />
                            Auth Loading: {authLoading ? 'true' : 'false'}<br />
                            Has User: {user ? 'true' : 'false'}<br />
                            Has Business: {business ? 'true' : 'false'}<br />
                            Has Customer: {customer ? 'true' : 'false'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Mark Visit Button */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <button
                            onClick={markVisit}
                            disabled={marking || !(customer?.id || customerId) || !(business?.id || user?.id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {marking ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Recording Visit...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Mark Visit</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="md:w-auto md:px-8 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
