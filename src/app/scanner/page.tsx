'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Camera, QrCode, AlertCircle, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ScannerPage() {
    const { user, business, loading } = useAuth()
    const router = useRouter()

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Please log in to use the scanner</p>
                    <Link href="/login" className="bg-teal-600 text-white px-6 py-2 rounded-lg inline-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            ←
                        </button>
                        <h1 className="text-xl font-semibold">QR Scanner</h1>
                        <div className="w-10" />
                    </div>

                    <div className="text-center">
                        {business?.business_logo_url ? (
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/30">
                                <img
                                    src={business.business_logo_url}
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {business?.name?.charAt(0) || 'B'}
                                </span>
                            </div>
                        )}
                        <h2 className="text-2xl font-bold mb-2">{business?.name}</h2>
                        <p className="text-white/80">Scan Customer QR Codes</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="text-center mb-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-6">
                            <Camera className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Use Your Phone Camera</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Use your phone's native camera app or Google Lens to scan customer QR codes
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                            How to Scan:
                        </h4>
                        <ol className="space-y-3 text-gray-700">
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                                <span>Ask customer to show their QR code (from email or phone)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                                <span>Open your phone's <strong>Camera app</strong> or <strong>Google Lens</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                                <span>Point camera at the QR code</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                                <span>Tap the notification/link that appears</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">5</span>
                                <span>You'll see customer info - click <strong>"Mark Visit"</strong></span>
                            </li>
                        </ol>
                    </div>

                    {/* Open Google Lens Button */}
                    <div className="text-center mb-6">
                        <a
                            href="google://lens"
                            onClick={(e) => {
                                // Fallback for devices without Google Lens app
                                setTimeout(() => {
                                    // If Google Lens didn't open, try Google app
                                    window.location.href = 'https://lens.google.com/'
                                }, 500)
                            }}
                            className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition-all w-full md:w-auto"
                        >
                            <Camera className="w-6 h-6" />
                            <span>Open Google Lens</span>
                        </a>
                        <p className="text-sm text-gray-500 mt-3">
                            Or use your phone's default camera app
                        </p>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                        <h4 className="font-bold text-yellow-900 mb-2">💡 Quick Tips:</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Most modern phones can scan QR codes with the default camera app</li>
                            <li>• On Android: Use Google Lens (built into camera or Google app)</li>
                            <li>• On iPhone: Just open Camera app and point at QR code</li>
                            <li>• Make sure you're logged in to mark visits</li>
                        </ul>
                    </div>

                    {/* Alternative Methods */}
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Alternative Methods:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/manual-visit"
                                className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 border border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 py-4 px-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-3 hover:shadow-md"
                            >
                                <div className="w-12 h-12 bg-white group-hover:bg-purple-100 rounded-full flex items-center justify-center shadow-sm">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">Manual Visit</p>
                                    <p className="text-xs text-gray-500">Search by name/phone</p>
                                </div>
                            </Link>

                            <Link
                                href="/register"
                                className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100 border border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-700 py-4 px-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-3 hover:shadow-md"
                            >
                                <div className="w-12 h-12 bg-white group-hover:bg-teal-100 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-2xl">👤</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">Add Customer</p>
                                    <p className="text-xs text-gray-500">Register new customer</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href="/dashboard"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
