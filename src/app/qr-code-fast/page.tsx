'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    QrCode,
    Download,
    Copy,
    CheckCircle,
    ArrowLeft,
    Share2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FastQRCodePage() {
    const { user, business, loading } = useAuth()
    const router = useRouter()
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [registrationUrl, setRegistrationUrl] = useState<string>('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (business?.id) {
            // Create customer registration URL
            const regUrl = `${window.location.origin}/customer-register/${business.id}`
            setRegistrationUrl(regUrl)

            // Generate QR code URL immediately
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(regUrl)}`
            setQrCodeUrl(qrUrl)
        }
    }, [business])

    const downloadQRCode = async () => {
        if (!qrCodeUrl) return

        try {
            const response = await fetch(qrCodeUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${business?.name || 'business'}-qr-code.png`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading QR code:', error)
        }
    }

    const copyToClipboard = async () => {
        if (!registrationUrl) return

        try {
            await navigator.clipboard.writeText(registrationUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Error copying to clipboard:', error)
        }
    }

    const shareQRCode = async () => {
        if (navigator.share && registrationUrl) {
            try {
                await navigator.share({
                    title: `Join ${business?.name || 'our'} Loyalty Program`,
                    text: 'Scan this QR code to join our loyalty program and start earning rewards!',
                    url: registrationUrl
                })
            } catch (error) {
                // Fallback to copy
                copyToClipboard()
            }
        } else {
            copyToClipboard()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to view your QR code</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold">Your QR Code</h1>
                        <div className="w-9 h-9" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Business Info */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b">
                        <div className="flex items-center space-x-4">
                            {business.business_logo_url ? (
                                <img
                                    src={business.business_logo_url}
                                    alt={business.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                    {business.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                                <p className="text-gray-600">Loyalty Program QR Code</p>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-8">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            {/* QR Code Display */}
                            <div className="text-center">
                                <div className="bg-gray-50 rounded-2xl p-8 inline-block shadow-inner">
                                    {qrCodeUrl ? (
                                        <img
                                            src={qrCodeUrl}
                                            alt="Business QR Code"
                                            className="w-64 h-64 mx-auto rounded-xl shadow-lg"
                                            onLoad={() => console.log('QR code loaded successfully')}
                                            onError={() => console.error('QR code failed to load')}
                                        />
                                    ) : (
                                        <div className="w-64 h-64 bg-gray-200 rounded-xl flex items-center justify-center animate-pulse">
                                            <QrCode className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-center gap-4 mt-8">
                                    <button
                                        onClick={downloadQRCode}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                    <button
                                        onClick={shareQRCode}
                                        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`${copied ? 'bg-green-600' : 'bg-gray-600'} text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg`}
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Information Panel */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">How to Use</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                                            <div>
                                                <p className="font-medium text-gray-900">Display QR Code</p>
                                                <p className="text-sm text-gray-600">Print or display this QR code at your business</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                                            <div>
                                                <p className="font-medium text-gray-900">Customer Scans</p>
                                                <p className="text-sm text-gray-600">Customers scan with their phone camera</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                                            <div>
                                                <p className="font-medium text-gray-900">Quick Registration</p>
                                                <p className="text-sm text-gray-600">They fill name, phone & email to join</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reward Info */}
                                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                    <h4 className="font-bold text-yellow-900 mb-2">Your Reward Program</h4>
                                    <p className="text-yellow-800 font-medium">{business.reward_title || 'Loyalty Reward'}</p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        {business.reward_description || 'Thank you for being a loyal customer!'}
                                    </p>
                                    <p className="text-yellow-600 text-sm mt-2">
                                        Customers earn rewards after {business.visit_goal || 5} visits
                                    </p>
                                </div>

                                {/* Link Display */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Direct Link</h4>
                                    <div className="bg-white rounded-lg p-3 border text-sm text-gray-600 break-all">
                                        {registrationUrl}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}