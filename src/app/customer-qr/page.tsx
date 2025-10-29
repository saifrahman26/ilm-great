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
    const [downloading, setDownloading] = useState(false)
    const [sharing, setSharing] = useState(false)

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

    const downloadQR = async () => {
        if (!customer?.id || downloading) return

        setDownloading(true)
        try {
            console.log('🔽 Starting QR download for customer:', customer.id)

            // Use our dedicated download endpoint
            const downloadUrl = `/api/qr-download/${customer.id}`
            console.log('🔽 Download URL:', downloadUrl)

            // Create a temporary link and trigger download
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `${customer.name.replace(/\s+/g, '-')}-loyalty-qr.png`
            link.target = '_blank' // Fallback to open in new tab if download fails
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log('✅ Download triggered successfully')

            // Show success feedback
            setTimeout(() => {
                alert('✅ QR code download started!')
            }, 500)

        } catch (error) {
            console.error('❌ Download failed:', error)
            alert('❌ Download failed. Opening QR code in new tab...')
            // Fallback: open QR code in new tab
            if (customer.qr_code_url) {
                window.open(customer.qr_code_url, '_blank')
            }
        } finally {
            setDownloading(false)
        }
    }

    const shareQR = async () => {
        if (!customer?.qr_code_url || !business?.name || sharing) return

        setSharing(true)
        try {
            console.log('📤 Starting QR share for customer:', customer.name)

            // Create shareable content
            const shareData = {
                title: `${customer.name}'s Loyalty QR Code`,
                text: `My loyalty QR code for ${business.name}. Scan to track my visits!`,
                url: customer.qr_code_url
            }

            // Check if Web Share API is supported
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                try {
                    console.log('📤 Using Web Share API')
                    await navigator.share(shareData)
                    console.log('✅ Share successful')
                } catch (err) {
                    console.log('❌ Web Share API failed:', err)
                    // Fallback to clipboard
                    fallbackShare()
                }
            } else {
                console.log('📤 Web Share API not supported, using fallback')
                fallbackShare()
            }

            function fallbackShare() {
                if (!customer?.qr_code_url) return

                // Fallback: copy to clipboard
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(customer.qr_code_url).then(() => {
                        alert('✅ QR code URL copied to clipboard!')
                        console.log('✅ Copied to clipboard successfully')
                    }).catch((err) => {
                        console.error('❌ Clipboard copy failed:', err)
                        // Final fallback: show URL in alert
                        prompt('Copy this QR code URL:', customer.qr_code_url)
                    })
                } else {
                    // Final fallback: show URL in prompt for manual copy
                    prompt('Copy this QR code URL:', customer.qr_code_url)
                }
            }
        } finally {
            setSharing(false)
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

    // Fix visit count logic - use modulo to show current cycle progress
    const visitGoal = business.visit_goal
    const currentCycleVisits = customer.visits % visitGoal
    const displayVisits = currentCycleVisits === 0 && customer.visits > 0 ? visitGoal : currentCycleVisits
    const progressPercentage = (displayVisits / visitGoal) * 100
    const totalRewards = Math.floor(customer.visits / visitGoal)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                            <QrCode className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">{customer.name}</h1>
                        <p className="text-blue-100 text-sm">Your Loyalty QR Code</p>
                    </div>

                    {/* Business Info */}
                    <div className="px-8 py-4 bg-gray-50 border-b text-center">
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.reward_title}</p>
                    </div>

                    {/* QR Code */}
                    <div className="px-6 py-6 text-center">
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4 inline-block">
                            {customer.qr_code_url ? (
                                <img
                                    src={customer.qr_code_url}
                                    alt="Your Loyalty QR Code"
                                    className="w-40 h-40 mx-auto"
                                    onError={(e) => {
                                        console.error('QR code image failed to load:', customer.qr_code_url)
                                        // Fallback: regenerate QR code URL
                                        const target = e.target as HTMLImageElement
                                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loyallinkk.vercel.app'
                                        const qrData = `${baseUrl}/mark-visit/${customer.id}`
                                        const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
                                        target.src = fallbackUrl
                                        console.log('🔄 Using fallback QR code:', fallbackUrl)
                                    }}
                                />
                            ) : (
                                // Generate QR code immediately if missing
                                (() => {
                                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loyallinkk.vercel.app'
                                    const qrData = `${baseUrl}/mark-visit/${customer.id}`
                                    const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
                                    console.log('🔄 Generating missing QR code:', generatedUrl)

                                    return (
                                        <img
                                            src={generatedUrl}
                                            alt="Your Loyalty QR Code"
                                            className="w-40 h-40 mx-auto"
                                            onLoad={() => {
                                                // Update customer record with generated QR code
                                                fetch(`/api/customer/${customer.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        qr_code_url: generatedUrl,
                                                        qr_data: qrData
                                                    })
                                                }).catch(console.error)
                                            }}
                                        />
                                    )
                                })()
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Show this QR code to the business on each visit to earn loyalty points
                        </p>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mb-6">
                            <button
                                onClick={downloadQR}
                                disabled={!customer?.id || downloading}
                                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                            >
                                {downloading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span>{downloading ? 'Downloading...' : 'Download'}</span>
                            </button>
                            <button
                                onClick={shareQR}
                                disabled={!customer?.qr_code_url || sharing}
                                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                            >
                                {sharing ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Share2 className="w-4 h-4" />
                                )}
                                <span>{sharing ? 'Sharing...' : 'Share'}</span>
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
                                {displayVisits} / {business.visit_goal} visits
                                {totalRewards > 0 && (
                                    <span className="text-green-600 ml-2">({totalRewards} reward{totalRewards === 1 ? '' : 's'})</span>
                                )}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <p className="text-sm text-gray-600 text-center">
                            {displayVisits >= business.visit_goal
                                ? `🎉 Congratulations! You've earned your ${business.reward_title}!`
                                : `${business.visit_goal - displayVisits} more visit${business.visit_goal - displayVisits === 1 ? '' : 's'} to earn your ${business.reward_title}`
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