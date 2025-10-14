'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import {
    QrCode,
    Download,
    Printer,
    Copy,
    CheckCircle,
    Users,
    Smartphone,
    Mail,
    ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { QRCodeSkeleton } from '@/components/LoadingSkeleton'

export default function QRCodePage() {
    const { user, business, loading } = useAuth()
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [scanRegisterQR, setScanRegisterQR] = useState<string>('')
    const [registrationUrl, setRegistrationUrl] = useState<string>('')
    const [loadingQR, setLoadingQR] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!business) {
            setLoadingQR(false)
            return
        }

        try {
            // Create registration URL for customers (use scan-register which exists)
            const regUrl = `${window.location.origin}/scan-register?business=${business.id}`
            setRegistrationUrl(regUrl)
            console.log('Registration URL:', regUrl)

            // Generate QR code directly using QR Server API
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(regUrl)}`
            console.log('Generated QR URL:', qrUrl)
            setQrCodeUrl(qrUrl)

            // Same QR for both purposes since we're using scan-register
            setScanRegisterQR(qrUrl)
        } catch (error) {
            console.error('Error generating QR code:', error)
        }

        setLoadingQR(false)
    }, [business])

    const downloadQRCode = async () => {
        if (!qrCodeUrl) return

        try {
            const response = await fetch(qrCodeUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${business?.name}-loyalty-qr.png`
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

    const printQRCode = () => {
        if (!qrCodeUrl) return

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>${business?.name} - Loyalty QR Code</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 40px;
                            margin: 0;
                        }
                        .header {
                            margin-bottom: 30px;
                        }
                        .business-name {
                            font-size: 32px;
                            font-weight: bold;
                            color: #1f2937;
                            margin-bottom: 10px;
                        }
                        .subtitle {
                            font-size: 18px;
                            color: #6b7280;
                            margin-bottom: 30px;
                        }
                        .qr-container {
                            margin: 40px 0;
                        }
                        .qr-code {
                            max-width: 300px;
                            height: auto;
                            border: 4px solid #e5e7eb;
                            border-radius: 12px;
                            padding: 20px;
                            background: white;
                        }
                        .instructions {
                            font-size: 16px;
                            color: #374151;
                            margin-top: 30px;
                            line-height: 1.6;
                        }
                        .reward-info {
                            background: #f3f4f6;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 30px;
                        }
                        .reward-title {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1f2937;
                            margin-bottom: 10px;
                        }
                        @media print {
                            body { padding: 20px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="business-name">${business?.name}</div>
                        <div class="subtitle">Join Our Loyalty Program</div>
                    </div>
                    
                    <div class="qr-container">
                        <img src="${qrCodeUrl}" alt="Loyalty Program QR Code" class="qr-code" />
                    </div>
                    
                    <div class="instructions">
                        <strong>How to Join:</strong><br>
                        1. Scan this QR code with your phone camera<br>
                        2. Fill in your name, phone, and email<br>
                        3. Receive your personal QR code<br>
                        4. Show it on each visit to earn rewards!
                    </div>
                    
                    <div class="reward-info">
                        <div class="reward-title">${business?.reward_title}</div>
                        <div>Earn rewards after ${business?.visit_goal} visits</div>
                    </div>
                </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading QR Code...</p>
                </div>
            </div>
        )
    }

    // Show loading animation while checking authentication
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

    // Show login prompt only after loading is complete and user is not authenticated
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            <div className="bg-gray-50 rounded-lg p-6 inline-block transition-all duration-300 hover:shadow-md">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="Business QR Code"
                                        className="w-48 h-48 mx-auto animate-in zoom-in-50 duration-500 delay-300"
                                    />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                                        <QrCode className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-3 mt-6 animate-in slide-in-from-bottom-2 duration-500 delay-500">
                                <button
                                    onClick={downloadQRCode}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={printQRCode}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className={`${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md`}
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
                                            <p className="text-sm text-gray-600">They fill in name, phone, and email (optional)</p>
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
            <div className="grid lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-700">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
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

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Link</h3>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <code className="text-sm text-gray-700 break-all">{registrationUrl}</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        You can also share this direct link with customers who prefer not to scan QR codes.
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