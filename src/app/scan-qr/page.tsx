'use client'

import { useEffect, useState, useRef } from 'react'
import { Camera, QrCode, AlertCircle, CheckCircle } from 'lucide-react'

export default function ScanQRPage() {
    const [error, setError] = useState('')
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<any>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        // Load jsQR library
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
        script.onload = () => console.log('✅ jsQR loaded')
        document.head.appendChild(script)

        return () => {
            stopCamera()
        }
    }, [])

    const startCamera = async () => {
        try {
            setError('')
            setScanning(true)
            setResult(null)

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            })

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()

                // Start scanning
                const scanInterval = setInterval(() => {
                    scanQRCode()
                }, 500)

                    ; (videoRef.current as any).scanInterval = scanInterval
            }
        } catch (err: any) {
            setError('Camera access denied or not available')
            setScanning(false)
        }
    }

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
        }

        if ((videoRef.current as any)?.scanInterval) {
            clearInterval((videoRef.current as any).scanInterval)
        }

        setScanning(false)
    }

    const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current || !(window as any).jsQR) {
            return
        }

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            context?.drawImage(video, 0, 0, canvas.width, canvas.height)

            const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
            if (imageData) {
                const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height)

                if (code) {
                    console.log('✅ QR Code found:', code.data)
                    stopCamera()
                    processQRCode(code.data)
                }
            }
        }
    }

    const processQRCode = async (qrData: string) => {
        try {
            // Extract customer ID from URL
            let customerId = ''

            if (qrData.includes('customer=')) {
                const url = new URL(qrData)
                customerId = url.searchParams.get('customer') || ''
            } else if (qrData.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                customerId = qrData
            }

            if (!customerId) {
                setError('Invalid customer QR code')
                return
            }

            // Record visit
            const response = await fetch('/api/record-visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId })
            })

            const data = await response.json()

            if (response.ok) {
                setResult({
                    success: true,
                    customer: data.customer,
                    visits: data.visits
                })
            } else {
                setError(data.error || 'Failed to record visit')
            }
        } catch (err) {
            setError('Failed to process QR code')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <QrCode className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Scan Customer QR Code</h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && result.success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <h3 className="font-semibold text-green-800 text-lg">Visit Recorded!</h3>
                            </div>
                            <div className="space-y-2 text-green-700">
                                <p><strong>Customer:</strong> {result.customer?.name}</p>
                                <p><strong>Total Visits:</strong> {result.visits}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setResult(null)
                                    startCamera()
                                }}
                                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                            >
                                Scan Another
                            </button>
                        </div>
                    )}

                    {!result && (
                        <div className="space-y-4">
                            {!scanning ? (
                                <button
                                    onClick={startCamera}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Camera className="h-5 w-5" />
                                    Start Camera
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={stopCamera}
                                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
                                    >
                                        Stop Camera
                                    </button>

                                    <div className="relative">
                                        <video
                                            ref={videoRef}
                                            className="w-full rounded-lg border-2 border-blue-300"
                                            playsInline
                                            muted
                                        />
                                        <canvas ref={canvasRef} className="hidden" />
                                        <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                                            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                                            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="text-center text-gray-600">
                                <p className="text-sm">
                                    Point your camera at a customer's QR code to record their visit
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}