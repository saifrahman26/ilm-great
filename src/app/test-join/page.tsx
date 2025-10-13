'use client'

import { useState } from 'react'
import { QrCode, Users, ExternalLink } from 'lucide-react'

export default function TestJoinPage() {
    const [businessId] = useState('bba780b3-bde5-4647-9e74-68bcfdb6e903')
    const [joinUrl] = useState(`http://localhost:3000/join/${businessId}`)
    const [qrCodeUrl] = useState(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`http://localhost:3000/join/${businessId}`)}`)

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <QrCode className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900">Business QR Code Test</h1>
                    <p className="text-gray-600 mt-2">Test the customer self-registration flow</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* QR Code Display */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business QR Code</h2>
                        <div className="text-center">
                            <div className="bg-gray-50 rounded-lg p-6 inline-block">
                                <img
                                    src={qrCodeUrl}
                                    alt="Business QR Code"
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Customers scan this QR code to register themselves
                            </p>
                        </div>
                    </div>

                    {/* Test Links */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Links</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Join URL (what QR code contains):
                                </label>
                                <div className="bg-gray-50 rounded p-3 text-sm font-mono break-all">
                                    {joinUrl}
                                </div>
                                <a
                                    href={joinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center mt-2 text-teal-600 hover:text-teal-700"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Test Join Page
                                </a>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business API:
                                </label>
                                <div className="bg-gray-50 rounded p-3 text-sm font-mono">
                                    /api/business/{businessId}
                                </div>
                                <a
                                    href={`/api/business/${businessId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center mt-2 text-teal-600 hover:text-teal-700"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Test Business API
                                </a>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    QR Code Generator:
                                </label>
                                <a
                                    href="/qr-code"
                                    className="inline-flex items-center text-teal-600 hover:text-teal-700"
                                >
                                    <QrCode className="w-4 h-4 mr-1" />
                                    View QR Code Page
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-lg shadow p-6 mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Test</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Expected Flow:</h3>
                            <ol className="text-sm text-gray-600 space-y-1">
                                <li>1. Customer scans business QR code</li>
                                <li>2. Opens join page: /join/{businessId}</li>
                                <li>3. Join page fetches business info via API</li>
                                <li>4. Customer fills registration form</li>
                                <li>5. Form submits to /api/register-customer</li>
                                <li>6. Customer gets personal QR code via email</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Potential Issues:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Business not found in database (404)</li>
                                <li>• Business API endpoint not working</li>
                                <li>• Register-customer API errors</li>
                                <li>• Email sending failures</li>
                                <li>• Database connection issues</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Current Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <div className="flex items-center">
                        <Users className="w-5 h-5 text-yellow-600 mr-2" />
                        <h3 className="font-medium text-yellow-900">Current Status</h3>
                    </div>
                    <p className="text-yellow-800 mt-2">
                        The business QR code system requires a business to exist in the database.
                        You may need to create a business account first through the signup flow,
                        or ensure the database is properly configured.
                    </p>
                </div>
            </div>
        </div>
    )
}