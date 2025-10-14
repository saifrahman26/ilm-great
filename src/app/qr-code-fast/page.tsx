'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    QrCode,
    Download,
    Copy,
    CheckCircle,
    ArrowLeft,
    Share2,
    Printer
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
        if (!qrCodeUrl || !business) return

        try {
            // Create a canvas to design the QR code with business info
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Set canvas size
            canvas.width = 800
            canvas.height = 1000

            // Background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Header background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 100)
            gradient.addColorStop(0, '#2563eb')
            gradient.addColorStop(1, '#7c3aed')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, 120)

            // Business name
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 36px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(business.name, canvas.width / 2, 70)

            // Subtitle
            ctx.font = '20px Arial'
            ctx.fillText('Loyalty Program', canvas.width / 2, 100)

            // Load and draw QR code
            const qrImage = new Image()
            qrImage.crossOrigin = 'anonymous'

            qrImage.onload = () => {
                // Draw QR code
                const qrSize = 400
                const qrX = (canvas.width - qrSize) / 2
                const qrY = 180

                // QR background
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40)
                ctx.strokeStyle = '#e5e7eb'
                ctx.lineWidth = 2
                ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40)

                // Draw QR code
                ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

                // Instructions
                ctx.fillStyle = '#374151'
                ctx.font = 'bold 24px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('Scan to Join Our Loyalty Program', canvas.width / 2, 650)

                // Reward info
                ctx.font = '20px Arial'
                ctx.fillStyle = '#6b7280'
                ctx.fillText(business.reward_title || 'Loyalty Rewards', canvas.width / 2, 690)

                // Visit goal
                ctx.font = '18px Arial'
                ctx.fillText(`Earn rewards after ${business.visit_goal || 5} visits`, canvas.width / 2, 720)

                // Steps
                ctx.font = 'bold 20px Arial'
                ctx.fillStyle = '#374151'
                ctx.textAlign = 'left'
                ctx.fillText('How it works:', 100, 780)

                ctx.font = '16px Arial'
                ctx.fillStyle = '#6b7280'
                ctx.fillText('1. Scan this QR code with your phone', 100, 810)
                ctx.fillText('2. Fill in your name, phone, and email', 100, 835)
                ctx.fillText('3. Get your personal QR code via email', 100, 860)
                ctx.fillText('4. Show your QR code on each visit', 100, 885)
                ctx.fillText('5. Earn rewards and enjoy benefits!', 100, 910)

                // Footer
                ctx.fillStyle = '#9ca3af'
                ctx.font = '14px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('Powered by LoyalLink', canvas.width / 2, 960)

                // Download the designed image
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${business.name}-loyalty-qr.png`
                        a.click()
                        window.URL.revokeObjectURL(url)
                    }
                })
            }

            qrImage.src = qrCodeUrl
        } catch (error) {
            console.error('Error creating designed QR code:', error)
            // Fallback to simple download
            try {
                const response = await fetch(qrCodeUrl)
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${business?.name || 'business'}-qr-code.png`
                a.click()
                window.URL.revokeObjectURL(url)
            } catch (fallbackError) {
                console.error('Fallback download failed:', fallbackError)
            }
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
        if (!qrCodeUrl || !business) return

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${business.name} - Loyalty QR Code</title>
                        <style>
                            @page { margin: 0.5in; }
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                margin: 0; 
                                padding: 20px;
                                background: white;
                            }
                            .header {
                                background: linear-gradient(135deg, #2563eb, #7c3aed);
                                color: white;
                                padding: 30px;
                                border-radius: 15px;
                                margin-bottom: 30px;
                            }
                            .business-name {
                                font-size: 36px;
                                font-weight: bold;
                                margin-bottom: 10px;
                            }
                            .subtitle {
                                font-size: 18px;
                                opacity: 0.9;
                            }
                            .qr-container {
                                background: white;
                                border: 3px solid #e5e7eb;
                                border-radius: 20px;
                                padding: 30px;
                                margin: 30px auto;
                                display: inline-block;
                                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                            }
                            .qr-code {
                                width: 300px;
                                height: 300px;
                                margin: 0 auto;
                            }
                            .instructions {
                                margin: 30px 0;
                                font-size: 20px;
                                font-weight: bold;
                                color: #374151;
                            }
                            .reward-info {
                                background: #fef3c7;
                                border: 2px solid #f59e0b;
                                border-radius: 10px;
                                padding: 20px;
                                margin: 20px auto;
                                max-width: 500px;
                            }
                            .reward-title {
                                font-size: 22px;
                                font-weight: bold;
                                color: #92400e;
                                margin-bottom: 10px;
                            }
                            .reward-description {
                                font-size: 16px;
                                color: #78350f;
                                margin-bottom: 10px;
                            }
                            .visit-goal {
                                font-size: 18px;
                                font-weight: bold;
                                color: #92400e;
                            }
                            .steps {
                                text-align: left;
                                max-width: 600px;
                                margin: 30px auto;
                                background: #f8fafc;
                                padding: 25px;
                                border-radius: 10px;
                                border: 1px solid #e2e8f0;
                            }
                            .steps h3 {
                                text-align: center;
                                color: #374151;
                                margin-bottom: 20px;
                                font-size: 20px;
                            }
                            .steps ol {
                                font-size: 16px;
                                color: #4b5563;
                                line-height: 1.8;
                            }
                            .steps li {
                                margin-bottom: 8px;
                            }
                            .footer {
                                margin-top: 40px;
                                font-size: 14px;
                                color: #9ca3af;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="business-name">${business.name}</div>
                            <div class="subtitle">Loyalty Program QR Code</div>
                        </div>
                        
                        <div class="qr-container">
                            <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
                        </div>
                        
                        <div class="instructions">
                            Scan to Join Our Loyalty Program
                        </div>
                        
                        <div class="reward-info">
                            <div class="reward-title">${business.reward_title || 'Loyalty Rewards'}</div>
                            <div class="reward-description">${business.reward_description || 'Thank you for being a loyal customer!'}</div>
                            <div class="visit-goal">🎁 Earn rewards after ${business.visit_goal || 5} visits</div>
                        </div>
                        
                        <div class="steps">
                            <h3>How it works:</h3>
                            <ol>
                                <li>Scan this QR code with your phone camera</li>
                                <li>Fill in your name, phone number, and email</li>
                                <li>Get your personal QR code sent to your email</li>
                                <li>Show your personal QR code on each visit</li>
                                <li>Collect visits and earn amazing rewards!</li>
                            </ol>
                        </div>
                        
                        <div class="footer">
                            Powered by LoyalLink • Digital Loyalty Made Simple
                        </div>
                    </body>
                </html>
            `)
            printWindow.document.close()

            // Wait for images to load before printing
            setTimeout(() => {
                printWindow.print()
            }, 1000)
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
                                        onClick={printQRCode}
                                        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>Print</span>
                                    </button>
                                    <button
                                        onClick={shareQRCode}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
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
                                    <button
                                        onClick={() => window.open(registrationUrl, '_blank')}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                                    >
                                        <QrCode className="w-4 h-4" />
                                        <span>Test Link</span>
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
                                    <p className="text-xs text-gray-500 mt-2">
                                        ✅ This link opens the customer self-registration form (separate from your dashboard)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}