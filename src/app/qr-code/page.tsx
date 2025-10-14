'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import Link from 'next/link'
import { QrCode, Download, Copy, CheckCircle, Smartphone, Users, Mail, ExternalLink, Printer } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function QRCodePage() {
    const { user, business, loading } = useAuth()
    const [copied, setCopied] = useState(false)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const registrationUrl = business ? `${baseUrl}/customer-register/${business.id}` : ''
    const qrCodeUrl = business ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}` : ''

    const downloadQRCode = () => {
        if (!qrCodeUrl) return

        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = `${business?.name || 'business'}-qr-code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const printQRCode = () => {
        if (!qrCodeUrl) return

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - ${business?.name}</title>
                        <style>
                            body { text-align: center; font-family: Arial, sans-serif; margin: 40px; }
                            img { max-width: 400px; margin: 20px 0; }
                            h1 { color: #333; }
                            p { color: #666; }
                        </style>
                    </head>
                    <body>
                        <h1>${business?.name} - Loyalty Program</h1>
                        <img src="${qrCodeUrl}" alt="QR Code" />
                        <p>Scan to join our loyalty program!</p>
                        <p>${business?.reward_title} after ${business?.visit_goal} visits</p>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const copyToClipboard = async () => {
        if (!registrationUrl) return

        try {
            await navigator.clipboard.writeText(registrationUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || !business) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to access QR codes.</p>
                    <Link href="/login" className="mt-4 inline-block bg-teal-600 text-white px-4 py-2 rounded">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout
            title="QR Code"
            subtitle="Let customers scan this to join your loyalty program"
        >
            {/* Main QR Code Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <QrCode className="w-6 h-6 text-white" />
                        <h2 className="text-lg font-semibold text-white">Your LoyalLink QR Code</h2>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* QR Code Display */}
                        <div className="text-center">
                            <div className="bg-gray-50 rounded-lg p-6 inline-block">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="Business QR Code"
                                        className="w-48 h-48 mx-auto"
                                    />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <QrCode className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-3 mt-6">
                                <button
                                    onClick={downloadQRCode}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={printQRCode}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className={`${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Information Panel */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-teal-50 rounded-full p-2 mt-1">
                                            <Smartphone className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Customer Scans QR</p>
                                            <p className="text-sm text-gray-600">They use their phone camera to scan your QR code</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-50 rounded-full p-2 mt-1">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Registration Form</p>
                                            <p className="text-sm text-gray-600">They fill in name, phone, and email (all required)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-purple-50 rounded-full p-2 mt-1">
                                            <Mail className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Personal QR Sent</p>
                                            <p className="text-sm text-gray-600">They receive their personal QR code via email</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                                <h4 className="font-semibold text-teal-900 mb-2">Your Reward Program</h4>
                                <p className="text-teal-800 font-medium">{business.reward_title}</p>
                                <p className="text-teal-700 text-sm mt-1">{business.reward_description}</p>
                                <p className="text-teal-600 text-sm mt-2">
                                    Customers earn rewards after {business.visit_goal} visits
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Instructions */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span>Print and display at your counter</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span>Add to your website or social media</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span>Include in email signatures</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span>Share the link directly with customers</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Link</h3>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <code className="text-sm text-gray-700 break-all">{registrationUrl}</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Share this link directly with customers or they can scan the QR code above.
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={copyToClipboard}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center space-x-1"
                        >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                        <a
                            href={registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open Link</span>
                        </a>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}