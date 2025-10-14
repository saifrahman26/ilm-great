'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QrCode, Download, User, Phone, Mail, Gift, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'

interface Customer {
    id: string
    name: string
    phone: string
    email: string | null
    visits: number
    qr_code_url: string
    qr_data: string
}

interface Business {
    id: string
    name: string
    reward_title: string
    reward_description: string
    visit_goal: number
}

function CustomerQRContent() {
    const searchParams = useSearchParams()
    const customerId = searchParams.get('id')

    const [customer, setCustomer] = useState<Customer | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!customerId) {
                setError('No customer ID provided')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/customer/${customerId}`)
                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Customer not found')
                } else {
                    setCustomer(result.customer)
                    setBusiness(result.business)
                }
            } catch (err) {
                setError('Failed to load customer information')
            }
            setLoading(false)
        }

        fetchCustomerData()
    }, [customerId])

    const downloadQRCode = async () => {
        if (!customer?.qr_code_url) return

        try {
            const response = await fetch(customer.qr_code_url)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${customer.name}-loyalty-qr.png`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading QR code:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading your QR code...</p>
                </div>
            </div>
        )
    }

    if (error || !customer || !business) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <QrCode className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Code Not Found</h2>
                    <p className="text-gray-600">{error || 'Unable to load your QR code'}</p>
                </div>
            </div>
        )
    }

    const progressPercentage = (customer.visits / business.visit_goal) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Logo size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Your Loyalty QR Code</h1>
                        <p className="text-blue-100">{business.name}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="px-8 py-6 bg-gray-50 border-b">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hello {customer.name}! 👋</h2>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center justify-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{customer.phone}</span>
                                </div>
                                {customer.email && (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* QR Code Display */}
                    <div className="px-8 py-8 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Show this QR code at each visit</h3>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 inline-block">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <img
                                    src={customer.qr_code_url}
                                    alt="Your Personal QR Code"
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                        </div>

                        <button
                            onClick={downloadQRCode}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto mb-6"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download QR Code</span>
                        </button>

                        {/* Progress */}
                        <div className="bg-teal-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <Gift className="w-5 h-5 text-teal-600 mr-2" />
                                <span className="font-medium text-teal-900">Reward Progress</span>
                            </div>
                            <p className="text-teal-800 mb-3">{customer.visits} of {business.visit_goal} visits completed</p>
                            <div className="w-full bg-teal-200 rounded-full h-3">
                                <div
                                    className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                ></div>
                            </div>
                            {customer.visits >= business.visit_goal && (
                                <div className="mt-3 flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Reward Earned! 🎉</span>
                                </div>
                            )}
                        </div>

                        {/* Reward Info */}
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2">{business.reward_title}</h4>
                            <p className="text-yellow-800 text-sm">{business.reward_description}</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="px-8 py-6 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-3">How to use:</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start space-x-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                                <span>Show this QR code to staff at {business.name}</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                                <span>They'll scan it to record your visit automatically</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                                <span>Earn your reward after {business.visit_goal} visits!</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            💡 Tip: Save this page to your phone's home screen for quick access
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CustomerQRPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <CustomerQRContent />
        </Suspense>
    )
}