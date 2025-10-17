'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import {
    RotateCcw,
    AlertCircle,
    Flashlight,
    FlashlightOff,
    Image as ImageIcon,
    ArrowLeft,
    QrCode,
    Scan,
    User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ScannerPage() {
    const { user, business, loading } = useAuth()
    const router = useRouter()
    const [error, setError] = useState('')
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
    const [flashOn, setFlashOn] = useState(false)
    const [jsQRLoaded, setJsQRLoaded] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [cameraStarted, setCameraStarted] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load jsQR library with better error handling
    useEffect(() => {
        const loadJsQR = async () => {
            if ((window as any).jsQR) {
                setJsQRLoaded(true)
                return
            }

            try {
                // Try loading from CDN first
                const script = document.createElement('script')
                script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
                script.crossOrigin = 'anonymous'

                const loadPromise = new Promise((resolve, reject) => {
                    script.onload = () => {
                        console.log('✅ jsQR library loaded successfully')
                        resolve(true)
                    }
                    script.onerror = (error) => {
                        console.error('❌ Failed to load jsQR from CDN:', error)
                        reject(error)
                    }
                })

                document.head.appendChild(script)
                await loadPromise

                // Wait a bit for the library to initialize
                setTimeout(() => {
                    if ((window as any).jsQR) {
                        console.log('✅ jsQR is ready')
                        setJsQRLoaded(true)
                    } else {
                        console.error('❌ jsQR not available after loading')
                        setError('QR scanner library failed to initialize. Please refresh the page.')
                    }
                }, 200)

            } catch (err) {
                console.error('❌ Error loading jsQR:', err)
                setError('Failed to load QR scanner. Please check your internet connection and refresh.')
            }
        }

        loadJsQR()

        return () => {
            stopCamera()
        }
    }, [])

    const startCamera = async () => {
        try {
            setError('')
            setCameraStarted(true)

            console.log('📷 Starting camera...')

            // Check if camera is supported
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Camera not supported on this device')
            }

            // Request camera permission with fallback constraints
            let stream: MediaStream
            try {
                // Try with ideal constraints first
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1280, min: 640 },
                        height: { ideal: 720, min: 480 }
                    }
                })
            } catch (err) {
                console.log('⚠️ Ideal constraints failed, trying basic constraints')
                // Fallback to basic constraints
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode
                    }
                })
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream

                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        console.log('📷 Video metadata loaded, starting playback')
                        videoRef.current.play().then(() => {
                            console.log('✅ Video playback started')
                            setScanning(true)
                            // Start scanning after a short delay
                            setTimeout(() => {
                                if (scanIntervalRef.current) {
                                    clearInterval(scanIntervalRef.current)
                                }
                                scanIntervalRef.current = setInterval(scanForQRCode, 200)
                                console.log('🔍 QR scanning started')
                            }, 1000)
                        }).catch(err => {
                            console.error('❌ Video playback failed:', err)
                            setError('Failed to start video playback. Please try again.')
                        })
                    }
                }

                videoRef.current.onerror = (err) => {
                    console.error('❌ Video error:', err)
                    setError('Video error occurred. Please try again.')
                }
            }
        } catch (err: any) {
            console.error('❌ Camera error:', err)
            setCameraStarted(false)

            if (err.name === 'NotAllowedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.')
            } else if (err.name === 'NotFoundError') {
                setError('No camera found on this device. Please ensure your device has a camera.')
            } else if (err.name === 'NotReadableError') {
                setError('Camera is being used by another application. Please close other camera apps and try again.')
            } else if (err.name === 'OverconstrainedError') {
                setError('Camera constraints not supported. Trying with basic settings...')
                // Try again with minimal constraints
                setTimeout(() => {
                    setFacingMode('user')
                    startCamera()
                }, 1000)
            } else {
                setError(`Camera access failed: ${err.message || 'Unknown error'}. Please try again.`)
            }
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current)
            scanIntervalRef.current = null
        }
        setScanning(false)
        setCameraStarted(false)
    }

    const scanForQRCode = () => {
        if (!videoRef.current || !canvasRef.current || !scanning) {
            return
        }

        if (!(window as any).jsQR) {
            console.log('⚠️ jsQR not available')
            return
        }

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d', { willReadFrequently: true })

        if (!context) {
            console.log('⚠️ Canvas context not available')
            return
        }

        if (video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
            return
        }

        try {
            // Set canvas size to match video
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            // Get image data for QR detection
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

            // Try QR detection with different settings for better success rate
            let code = null

            // First attempt: standard detection
            try {
                code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert"
                })
            } catch (err) {
                console.log('⚠️ First QR detection attempt failed')
            }

            // Second attempt: with inversion if first failed
            if (!code) {
                try {
                    code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "attemptBoth"
                    })
                } catch (err) {
                    console.log('⚠️ Second QR detection attempt failed')
                }
            }

            // Third attempt: try with different region (center crop)
            if (!code && canvas.width > 200 && canvas.height > 200) {
                try {
                    const centerX = Math.floor(canvas.width / 4)
                    const centerY = Math.floor(canvas.height / 4)
                    const centerWidth = Math.floor(canvas.width / 2)
                    const centerHeight = Math.floor(canvas.height / 2)

                    const centerImageData = context.getImageData(centerX, centerY, centerWidth, centerHeight)
                    code = (window as any).jsQR(centerImageData.data, centerImageData.width, centerImageData.height, {
                        inversionAttempts: "attemptBoth"
                    })
                } catch (err) {
                    console.log('⚠️ Center crop QR detection failed')
                }
            }

            if (code && code.data) {
                console.log('✅ QR Code detected:', code.data)
                handleQRCodeDetected(code.data)
            }
        } catch (err) {
            console.error('❌ QR scan error:', err)
        }
    }

    const handleCustomerScan = async (customerId: string) => {
        try {
            setScanning(true)
            setError('')

            // Redirect to mark-visit page to show customer info
            router.push(`/mark-visit/${customerId}`)
        } catch (error) {
            setError('Failed to load customer')
            setTimeout(() => {
                setError('')
                startCamera()
            }, 3000)
        } finally {
            setScanning(false)
        }
    }

    const handleQRScan = (qrData: string) => {
        // Handle other types of QR codes
        setError('QR code detected but not a customer code')
        setTimeout(() => {
            setError('')
            startCamera()
        }, 2000)
    }

    const handleQRCodeDetected = (qrData: string) => {
        stopCamera()

        if (navigator.vibrate) {
            navigator.vibrate(100)
        }

        try {
            if (qrData.startsWith('http')) {
                const url = new URL(qrData)
                const customerId = url.searchParams.get('customer')
                if (customerId) {
                    // Handle customer QR code scan directly
                    handleCustomerScan(customerId)
                    return
                }
            }

            if (qrData.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                // Handle customer UUID directly
                handleCustomerScan(qrData)
                return
            }

            // Handle other QR data directly
            handleQRScan(qrData)
        } catch (error) {
            setError('Invalid QR code')
            setTimeout(() => {
                setError('')
                startCamera()
            }, 2000)
        }
    }

    const toggleFlash = async () => {
        if (streamRef.current) {
            const track = streamRef.current.getVideoTracks()[0]
            if (track) {
                try {
                    const capabilities = track.getCapabilities()
                    if ('torch' in capabilities) {
                        await track.applyConstraints({
                            advanced: [{ torch: !flashOn } as any]
                        })
                        setFlashOn(!flashOn)
                    }
                } catch (err) {
                    console.error('Flash error:', err)
                }
            }
        }
    }

    const switchCamera = () => {
        stopCamera()
        setFacingMode(facingMode === 'user' ? 'environment' : 'user')
        setTimeout(startCamera, 300)
    }

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Please log in to use the scanner</p>
                    <Link href="/login" className="bg-teal-600 text-white px-6 py-2 rounded-lg">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    // Camera View (Full Screen UPI-style)
    if (cameraStarted) {
        return (
            <div className="fixed inset-0 bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Enhanced Header with Business Branding */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center justify-between p-4 pt-12">
                        <button
                            onClick={stopCamera}
                            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        {/* Business Logo in Header */}
                        <div className="flex items-center space-x-3">
                            {business?.business_logo_url ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                                    <img
                                        src={business.business_logo_url}
                                        alt={business.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                        {business?.name?.charAt(0) || 'B'}
                                    </span>
                                </div>
                            )}
                            <h1 className="text-white text-lg font-medium">{business?.name || 'Scanner'}</h1>
                        </div>

                        <div className="w-11 h-11" /> {/* Spacer */}
                    </div>
                </div>

                {/* Scanner Box */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-64 h-64 sm:w-80 sm:h-80 relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>

                            <div className="absolute inset-0 overflow-hidden rounded-lg">
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            </div>

                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>

                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                            <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                                Point camera at QR code
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-center justify-center space-x-8 p-8 pb-12">
                        <button
                            onClick={toggleFlash}
                            className="p-4 rounded-full bg-black/30 text-white"
                        >
                            {flashOn ? <FlashlightOff className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
                        </button>

                        <button className="p-4 rounded-full bg-black/30 text-white opacity-50">
                            <ImageIcon className="w-6 h-6" />
                        </button>

                        <button
                            onClick={switchCamera}
                            className="p-4 rounded-full bg-black/30 text-white"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 z-20">
                        <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">{error}</p>
                            {error.includes('permission') && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 bg-white text-red-500 px-4 py-2 rounded text-sm"
                                >
                                    Refresh & Try Again
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {!scanning && !error && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Starting camera...</p>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Main Scanner Page (Enhanced UPI-style landing page)
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
            {/* Header with Business Branding */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white">
                <div className="max-w-md mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold">QR Scanner</h1>
                        <div className="w-9 h-9" /> {/* Spacer */}
                    </div>

                    {/* Business Logo & Info */}
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
                        <h2 className="text-xl font-bold mb-2">{business?.name || 'LoyalLink Business'}</h2>
                        <p className="text-white/80 text-sm">Loyalty Program Scanner</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-6 -mt-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center">
                        {/* Enhanced QR Scanner Icon */}
                        <div className="relative mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                <QrCode className="w-16 h-16 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <Scan className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Scan</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Scan your customer's QR code to instantly record their visit and award loyalty points
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="text-left">
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Main Scan Button */}
                        <button
                            onClick={startCamera}
                            disabled={!jsQRLoaded}
                            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-4 mb-6 shadow-md"
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Scan className="w-5 h-5" />
                            </div>
                            <span>{jsQRLoaded ? 'Start Scanning' : 'Loading Scanner...'}</span>
                        </button>

                        {/* Test QR Code Button */}
                        {jsQRLoaded && (
                            <button
                                onClick={() => {
                                    // Test with a sample customer ID
                                    const testCustomerId = 'test-customer-123'
                                    console.log('🧪 Testing QR detection with:', testCustomerId)
                                    handleQRCodeDetected(testCustomerId)
                                }}
                                className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-700 transition-colors mb-8 flex items-center justify-center space-x-2"
                            >
                                <QrCode className="w-4 h-4" />
                                <span>Test Scanner (Demo)</span>
                            </button>
                        )}

                        {/* Enhanced Alternative Options */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                                <div className="h-px bg-gray-300 flex-1"></div>
                                <span className="px-3">Alternative Methods</span>
                                <div className="h-px bg-gray-300 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href="/manual-visit"
                                    className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 border border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 py-4 px-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-3 hover:shadow-md"
                                >
                                    <div className="w-10 h-10 bg-white group-hover:bg-purple-100 rounded-full flex items-center justify-center shadow-sm">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold">Manual Visit</span>
                                </Link>

                                <Link
                                    href="/register"
                                    className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100 border border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-700 py-4 px-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-3 hover:shadow-md"
                                >
                                    <div className="w-10 h-10 bg-white group-hover:bg-teal-100 rounded-full flex items-center justify-center shadow-sm">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold">Add Customer</span>
                                </Link>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-8 bg-blue-50 rounded-lg p-4 text-left">
                            <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                                <QrCode className="w-4 h-4 mr-2" />
                                How to scan:
                            </h3>
                            <ol className="text-sm text-blue-800 space-y-2">
                                <li className="flex items-start">
                                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                                    Customer shows their personal QR code
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                                    Click "Scan QR Code" to open camera
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                                    Point camera at QR code to record visit
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}