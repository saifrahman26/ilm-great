'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, AlertCircle, QrCode, Loader } from 'lucide-react'
import PhoneInput from '@/components/PhoneInput'

export default function JoinSimplePage() {
    const params = useParams()
    const businessId = params.businessId as string

    const [formData, setFormData] = useState({
        name: '',
        phone: '+91',
        email: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [customer, setCustomer] = useState<any>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.phone.trim()) {
            setError('Name and phone number are required')
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
                    email: formData.email.trim() || null
                }),
            })

            const result = await response.json()

            if (response.ok) {
                setCustomer(result.customer)
                setSuccess(true)
            } else {
                setError(result.error || 'Registration failed')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        }

        setSubmitting(false)
    }

    if (!businessId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
                    <p className="text-gray-600">This registration link is not valid.</p>
                </div>
            </div>
        )
    }

    if (success && customer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
                    <p className="text-gray-600 mb-6">
                        You've successfully joined the loyalty program. Your visit has been recorded!
                    </p>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Your Progress</h3>
                        <p className="text-blue-800">{customer.visits} of 5 visits completed</p>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(customer.visits / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    {customer.email && (
                        <p className="text-sm text-gray-600 mb-4">
                            📧 Your personal QR code has been sent to your email
                        </p>
                    )}

                    <a
                        href={`/customer-qr?id=${customer.id}`}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <QrCode className="w-4 h-4" />
                        <span>View QR Code</span>
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                    <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Loyalty Program</h1>
                    <p className="text-gray-600">Enter your details to start earning rewards</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                        </label>
                        <PhoneInput
                            value={formData.phone || '+91'}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            placeholder="9876543210"
                            className="text-gray-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            We'll send your QR code to this email
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {submitting ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Registering...</span>
                            </>
                        ) : (
                            <span>Join Now</span>
                        )}
                    </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Already registered? Just enter your phone number to record your visit
                </p>
            </div>
        </div>
    )
}