'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QrCode, Download, Share2, User, Gift, Loader, AlertCircle } from 'lucide-react'
import Logo from '@/components/Logo'

interface Customer {
    id: string
    name: string
    email: string
    phone: string
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

    const downloadQR = () => {
        if (!customer?.qr_code_url) return

        const link = document.createElement('a')
        link.href = customer.qr_code_url
        link.download = `${customer.name}-loyalty-qr.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const shareQR = async () => {
        if (!customer?.qr_code_url) return

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${customer.name}'s Loyalty QR Code`,
                    text: `My loyalty QR code for ${business?.name}`,
                    url: customer.qr_code_url
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(customer.qr_code_url)
                alert('QR code URL copied to clipboard!')
            } catch (err) {
                console.log('Error copying to clipboard:', err)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
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
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600">{error || 'Customer or business information not found'}</p>
                </div>
            </div>
        )
    }

    const progressPercentage = (customer.visits / business.visit_goal) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Logo size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{customer.name}</h1>
                        <p className="text-blue-100">Your Loyalty QR Code</p>
                    </div>

                    {/* Business Info */}
                    <div className="px-8 py-4 bg-gray-50 border-b text-center">
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.reward_title}</p>
                    </div>

                    {/* QR Code */}
                    <div className="px-8 py-8 text-center">
                        <div className="bg-white border-4 border-gray-200 rounded-2xl p-6 mb-6 inline-block">
                            <img
                                src={customer.qr_code_url}
                                alt="Your Loyalty QR Code"
                                className="w-48 h-48 mx-auto"
                            />
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Show this QR code to the business on each visit to earn loyalty points
                        </p>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mb-6">
                            <button
                                onClick={downloadQR}
                                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </button>
                            <button
                                onClick={shareQR}
                                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="px-8 py-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Gift className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-gray-900">Progress</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {customer.visits} / {business.visit_goal} visits
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                        </div>

                        <p className="text-sm text-gray-600 text-center">
                            {customer.visits >= business.visit_goal
                                ? `🎉 Congratulations! You've earned your ${business.reward_title}!`
                                : `${business.visit_goal - customer.visits} more visits to earn your ${business.reward_title}`
                            }
                        </p>
                    </div>

                    {/* Customer Info */}
                    <div className="px-8 py-4 border-t">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{customer.phone}</span>
                            {customer.email && (
                                <>
                                    <span>•</span>
                                    <span>{customer.email}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">How to use your QR code:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>1. Show this QR code to the business staff</li>
                        <li>2. They will scan it to record your visit</li>
                        <li>3. Earn points with each visit</li>
                        <li>4. Redeem your reward when you reach {business.visit_goal} visits!</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default function CustomerQRPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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