'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Camera, QrCode, AlertCircle } from 'lucide-react'

export default function SimpleScanner() {
    const { user, business } = useAuth()
    const [error, setError] = useState('')
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState('')
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        // Load jsQR library
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
        script.onload = () => {
            console.log('✅ jsQR loaded')
        }
        document.head.appendChild(script)

        return () => {
            stopCamera()
        }
    }, [])

    const startCamera = async () => {
        try {
            setError('')
            setScanning(true)

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

                    // Store interval to clear later
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
                    setResult(code.data)
                    stopCamera()

                    // Process the QR code
                    processQRCode(code.data)
                }
            }
        }
    }

    const processQRCode = (data: string) => {
        console.log('Processing QR code:', data)

        // Check if it's a customer registration URL
        if (data.includes('/customer-register/')) {
            window.location.href = data
        }
        // Check if it's a customer QR code
        else if (data.includes('/customer-qr')) {
            window.location.href = data
        }
        // Generic URL
        else if (data.startsWith('http')) {
            window.open(data, '_blank')
        }
        else {
            setResult(`QR Code Content: ${data}`)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <QrCode className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-green-800 mb-2">QR Code Scanned!</h3>
                            <p className="text-green-700">{result}</p>
                        </div>
                    )}

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
                            <button
                                onClick={stopCamera}
                                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
                            >
                                Stop Camera
                            </button>
                        )}

                        {scanning && (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    className="w-full rounded-lg border-2 border-blue-300"
                                    playsInline
                                    muted
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="hidden"
                                />
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                                </div>
                            </div>
                        )}

                        <div className="text-center text-gray-600">
                            <p className="text-sm">
                                Point your camera at a QR code to scan it
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}