'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, AlertCircle, QrCode, Loader, User, Phone, Mail, Gift } from 'lucide-react'

export default function CustomerRegisterPage() {
    const params = useParams()
    const businessId = params.businessId as string

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [customer, setCustomer] = useState<any>(null)
    const [businessName, setBusinessName] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields are filled
        if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
            setError('All fields are required')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address')
            return
        }

        // Basic phone validation (at least 10 digits)
        const phoneDigits = formData.phone.replace(/\D/g, '')
        if (phoneDigits.length < 10) {
            setError('Please enter a valid phone number (at least 10 digits)')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const response = await fetch('/api/register-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim()
                }),
            })

            const result = await response.json()

            if (response.ok) {
                setCustomer(result.customer)
                setBusinessName(result.businessName || 'Business')
                setSuccess(true)
            } else {
                setError(result.error || 'Registration failed. Please try again.')
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.')
        }

        setSubmitting(false)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (error) setError('')
    }

    if (!businessId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
                    <p className="text-gray-600">This QR code is not valid. Please scan a valid business QR code.</p>
                </div>
            </div>
        )
    }

    if (success && customer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome to {businessName}!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {customer.isExistingCustomer
                            ? "Welcome back! Your visit has been recorded and your information updated."
                            : "You've successfully joined our loyalty program! Your first visit has been recorded."
                        }
                    </p>

                    <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-center mb-3">
                            <Gift className="w-6 h-6 text-blue-600 mr-2" />
                            <h3 className="font-semibold text-blue-900">Your Progress</h3>
                        </div>
                        <p className="text-blue-800 mb-3">
                            {customer.visits} of 5 visits completed
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((customer.visits / 5) * 100, 100)}%` }}
                            />
                        </div>
                        {customer.visits >= 5 && (
                            <p className="text-green-600 font-semibold mt-2">
                                🎉 Congratulations! You've earned a reward!
                            </p>
                        )}
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">What's Next?</h3>
                        <ul className="text-sm text-yellow-800 space-y-1 text-left">
                            <li>• Your personal QR code has been sent to your email</li>
                            <li>• Show your QR code on each visit to earn points</li>
                            <li>• Collect 5 visits to earn your reward</li>
                            <li>• Keep your QR code safe for future visits</li>
                        </ul>
                    </div>

                    <a
                        href={`/customer-qr?id=${customer.id}`}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <QrCode className="w-5 h-5" />
                        <span>View My QR Code</span>
                    </a>

                    <p className="text-xs text-gray-500 mt-6">
                        Thank you for joining our loyalty program!
                        Check your email for your personal QR code.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
                    <QrCode className="w-16 h-16 text-white mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Join Our Loyalty Program</h1>
                    <p className="text-blue-100">Fill in your details to start earning rewards</p>
                </div>

                {/* Reward Info */}
                <div className="px-8 py-6 bg-gray-50 border-b text-center">
                    <div className="flex items-center justify-center mb-3">
                        <Gift className="w-6 h-6 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Earn Rewards</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Get points with every visit and unlock exclusive rewards
                    </p>
                    <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                        🎁 Free reward after 5 visits
                    </div>
                </div>

                {/* Registration Form */}
                <div className="px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                required
                            />
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                required
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                We'll send your personal QR code to this email
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Registering...</span>
                                </>
                            ) : (
                                <>
                                    <Gift className="w-5 h-5" />
                                    <span>Join Loyalty Program</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            * All fields are required
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Already a member? Just enter your phone number to record your visit
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}