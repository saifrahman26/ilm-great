'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, QrCode, User, Store, Target, Gift } from 'lucide-react'

interface CustomerData {
    customer: {
        id: string
        name: string
        email: string
        visits: number
    }
    business: {
        id: string
        name: string
        type: string
        visitGoal: number
        rewardTitle: string
    }
    qrCode: {
        url: string
        data: string
        downloadUrl: string
    }
}

export default function QRDownloadPage() {
    const params = useParams()
    const customerId = params.customerId as string
    const [data, setData] = useState<CustomerData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (customerId) {
            fetchCustomerData()
        }
    }, [customerId])

    const fetchCustomerData = async () => {
        try {
            const response = await fetch(`/api/generate-customer-qr?customerId=${customerId}`)
            const result = await response.json()

            if (result.success) {
                setData(result)
            } else {
                setError(result.error || 'Failed to load customer data')
            }
        } catch (err) {
            setError('Failed to load customer data')
            console.error('Error fetching customer data:', err)
        } finally {
            setLoading(false)
        }
    }

    const downloadQR = () => {
        if (data) {
            const link = document.createElement('a')
            link.href = data.qrCode.downloadUrl
            link.download = `${data.business.name}-${data.customer.name}-QR.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const saveQRToPhone = async () => {
        if (data && navigator.share) {
            try {
                await navigator.share({
                    title: `${data.business.name} - Loyalty QR Code`,
                    text: `My loyalty QR code for ${data.business.name}`,
                    url: data.qrCode.url
                })
            } catch (err) {
                console.log('Share failed:', err)
                downloadQR()
            }
        } else {
            downloadQR()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your QR code...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    const progressPercentage = Math.min((data.customer.visits / data.business.visitGoal) * 100, 100)

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <QrCode className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Loyalty QR Code</h1>
                    <p className="text-gray-600">Save this to your phone for easy scanning</p>
                </div>

                {/* Business Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Store className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{data.business.name}</h2>
                            <p className="text-gray-600 text-sm">{data.business.type}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{data.customer.name}</p>
                            <p className="text-gray-600 text-sm">{data.customer.email}</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Loyalty Progress</span>
                            <span className="text-sm text-gray-600">
                                {data.customer.visits} / {data.business.visitGoal} visits
                            </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Target className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                                {data.business.visitGoal - data.customer.visits} more visits to earn:
                                <strong className="text-purple-600 ml-1">{data.business.rewardTitle}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            📱 Your Personal QR Code
                        </h3>

                        {/* QR Code with Business Branding */}
                        <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-xl mb-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {data.business.name}
                                </h2>
                                <p className="text-gray-600 text-sm mb-4">Loyalty Program</p>

                                <img
                                    src={data.qrCode.url}
                                    alt="Your QR Code"
                                    className="w-48 h-48 mx-auto border-2 border-purple-200 rounded-lg"
                                />

                                <p className="text-gray-500 text-xs mt-3">
                                    Customer: {data.customer.name}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-6">
                            Show this QR code to staff at {data.business.name} to record your visit instantly
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={saveQRToPhone}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                    >
                        <Download className="w-5 h-5" />
                        Save QR Code to Phone
                    </button>

                    <button
                        onClick={downloadQR}
                        className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                        <Download className="w-4 h-4" />
                        Download as Image
                    </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 How to Use:</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Save this QR code to your phone's photo gallery</li>
                        <li>• Show it to staff at {data.business.name} during your visit</li>
                        <li>• Staff will scan it to record your visit automatically</li>
                        <li>• Track your progress towards earning rewards!</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}