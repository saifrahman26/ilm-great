'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QrCode, Award, Calendar, Loader2 } from 'lucide-react'

export default function MyQRPage() {
    const params = useParams()
    const customerId = params.customerId as string

    const [customer, setCustomer] = useState<any>(null)
    const [business, setBusiness] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadCustomerData()
    }, [customerId])

    const loadCustomerData = async () => {
        try {
            setLoading(true)
            setError('')

            // Load customer
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single()

            if (customerError) throw customerError

            setCustomer(customerData)

            // Load business
            const { data: businessData, error: businessError } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', customerData.business_id)
                .single()

            if (businessError) throw businessError

            setBusiness(businessData)
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Could not load your information')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your loyalty card...</p>
                </div>
            </div>
        )
    }

    if (error || !customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
                    <p className="text-gray-600">{error || 'Customer information not found'}</p>
                </div>
            </div>
        )
    }

    // Fix visit count logic - use modulo to show current cycle progress
    const visitGoal = business?.visit_goal || 5
    const currentCycleVisits = customer.visits % visitGoal
    const displayVisits = currentCycleVisits === 0 && customer.visits > 0 ? visitGoal : currentCycleVisits
    const progressPercentage = (displayVisits / visitGoal) * 100
    const visitsLeft = Math.max(visitGoal - displayVisits, 0)
    const totalRewards = Math.floor(customer.visits / visitGoal)

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 p-4">
            <div className="max-w-md mx-auto pt-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <QrCode className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold mb-1">Your Loyalty Card</h1>
                        <p className="text-purple-100">{business?.name}</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{customer.name}</h2>
                        <p className="text-gray-600">{customer.phone}</p>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress to Reward</span>
                            <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200">
                            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-blue-900">{displayVisits}</p>
                            <p className="text-sm text-blue-700">Current Visits</p>
                            {totalRewards > 0 && (
                                <p className="text-xs text-blue-600 mt-1">{totalRewards} reward{totalRewards === 1 ? '' : 's'} earned</p>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
                            <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-purple-900">{visitsLeft}</p>
                            <p className="text-sm text-purple-700">To Go</p>
                        </div>
                    </div>

                    {/* Reward Info */}
                    {visitsLeft > 0 ? (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-300 text-center">
                            <p className="text-yellow-900 font-semibold mb-1">🎁 Your Reward</p>
                            <p className="text-orange-800 text-lg font-bold mb-2">{business?.reward_title}</p>
                            <p className="text-yellow-700 text-sm">
                                Just {visitsLeft} more visit{visitsLeft === 1 ? '' : 's'}!
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300 text-center">
                            <p className="text-2xl mb-2">🎉</p>
                            <p className="text-green-900 font-bold text-lg mb-1">Reward Earned!</p>
                            <p className="text-green-700 text-sm">
                                Show this to claim your {business?.reward_title}
                            </p>
                        </div>
                    )}
                </div>

                {/* QR Code */}
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Show This QR Code</h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 inline-block border-2 border-gray-200">
                        <img
                            src={customer.qr_code_url}
                            alt="Your QR Code"
                            className="w-48 h-48 mx-auto"
                        />
                    </div>
                    <p className="text-gray-600 text-sm mt-4">
                        Present this QR code to the staff at {business?.name} to earn points
                    </p>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                    <h3 className="font-bold text-gray-900 mb-3">📋 How it works:</h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                            <span>Visit {business?.name}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                            <span>Show this QR code to the staff</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                            <span>They'll scan it to record your visit</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                            <span>Earn your reward after {business?.visit_goal} visits!</span>
                        </li>
                    </ol>
                </div>

                <div className="text-center mt-6 text-sm text-gray-500">
                    <p>Powered by 🔗 LoyalLink</p>
                </div>
            </div>
        </div>
    )
}
