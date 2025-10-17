'use client'

import { useState } from 'react'

export default function TestWhatsApp() {
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('Hello! This is a test message from LoyalLink! 🎉')
    const [customerName, setCustomerName] = useState('John Doe')
    const [businessName, setBusinessName] = useState('Coffee Shop')
    const [points, setPoints] = useState(10)
    const [totalPoints, setTotalPoints] = useState(50)
    const [currentVisits, setCurrentVisits] = useState(3)
    const [visitGoal, setVisitGoal] = useState(5)
    const [type, setType] = useState('simple')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const sendWhatsApp = async () => {
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    message,
                    customerName,
                    businessName,
                    points: type === 'loyalty' ? points : undefined,
                    totalPoints: type === 'loyalty' ? totalPoints : undefined,
                    currentVisits: ['loyalty', 'reminder'].includes(type) ? currentVisits : undefined,
                    visitGoal: ['loyalty', 'reminder'].includes(type) ? visitGoal : undefined,
                    type
                })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ error: 'Failed to send WhatsApp message' })
        } finally {
            setLoading(false)
        }
    }

    const checkStatus = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/send-whatsapp')
            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ error: 'Failed to check WhatsApp status' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        📱 WhatsApp Test Center
                    </h1>

                    <div className="space-y-4">
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number (with country code)
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1234567890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Message Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="simple">Simple Message</option>
                                <option value="welcome">Welcome Message</option>
                                <option value="loyalty">Loyalty Update</option>
                                <option value="reminder">Visit Reminder</option>
                            </select>
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Loyalty Details */}
                        {(type === 'loyalty' || type === 'reminder') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Visits
                                    </label>
                                    <input
                                        type="number"
                                        value={currentVisits}
                                        onChange={(e) => setCurrentVisits(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Visit Goal
                                    </label>
                                    <input
                                        type="number"
                                        value={visitGoal}
                                        onChange={(e) => setVisitGoal(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {type === 'loyalty' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Points Earned
                                    </label>
                                    <input
                                        type="number"
                                        value={points}
                                        onChange={(e) => setPoints(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Points
                                    </label>
                                    <input
                                        type="number"
                                        value={totalPoints}
                                        onChange={(e) => setTotalPoints(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Custom Message */}
                        {type === 'simple' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Custom Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={sendWhatsApp}
                                disabled={loading || !phone}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : '📱 Send WhatsApp'}
                            </button>
                            <button
                                onClick={checkStatus}
                                disabled={loading}
                                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                📊 Check Status
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className="mt-6 p-4 bg-gray-100 rounded-md">
                                <h3 className="font-medium text-gray-900 mb-2">Result:</h3>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Setup Instructions */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">🚀 Setup Instructions:</h3>
                    <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Go to <a href="https://green-api.com" target="_blank" className="underline">green-api.com</a></li>
                        <li>2. Create a free account (3000 messages/month)</li>
                        <li>3. Get your Instance ID and Access Token</li>
                        <li>4. Add them to your .env.local file</li>
                        <li>5. Scan QR code to connect your WhatsApp</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}