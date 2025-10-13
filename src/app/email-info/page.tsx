'use client'

export default function EmailInfoPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        📧 Email Configuration Status
                    </h1>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-blue-900 mb-4">
                            🔒 Current Status: Sandbox Mode
                        </h2>
                        <p className="text-blue-800 mb-4">
                            Your LoyalLink application is currently running in <strong>Resend Sandbox Mode</strong>.
                            This means all emails are redirected to the verified email address:
                            <code className="bg-blue-100 px-2 py-1 rounded">warriorsaifdurer@gmail.com</code>
                        </p>
                        <p className="text-blue-700">
                            This is perfect for testing and development, but customers won't receive emails directly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-900 mb-4">
                                ✅ What's Working
                            </h3>
                            <ul className="text-green-800 space-y-2">
                                <li>• Email sending functionality</li>
                                <li>• QR code generation</li>
                                <li>• Customer registration</li>
                                <li>• Visit tracking</li>
                                <li>• Dashboard analytics</li>
                                <li>• All core features</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                                ⚠️ Current Limitation
                            </h3>
                            <ul className="text-yellow-800 space-y-2">
                                <li>• Emails go to verified address only</li>
                                <li>• Customers won't receive QR codes directly</li>
                                <li>• Manual QR code sharing needed</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-purple-900 mb-4">
                            🚀 How to Enable Full Email Functionality
                        </h3>
                        <div className="text-purple-800 space-y-4">
                            <div>
                                <h4 className="font-semibold">Option 1: Verify a Domain (Recommended)</h4>
                                <ol className="list-decimal list-inside space-y-1 ml-4">
                                    <li>Purchase a domain (e.g., loyallink.com)</li>
                                    <li>Go to <a href="https://resend.com/domains" target="_blank" className="text-purple-600 underline">resend.com/domains</a></li>
                                    <li>Add and verify your domain</li>
                                    <li>Update the 'from' address to use your domain</li>
                                    <li>Deploy the updated code</li>
                                </ol>
                            </div>
                            <div>
                                <h4 className="font-semibold">Option 2: Alternative Email Service</h4>
                                <p>Consider using SendGrid, Mailgun, or AWS SES which may have different limitations.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            🧪 Testing Your Application
                        </h3>
                        <div className="text-gray-700 space-y-2">
                            <p><strong>For now, you can test all features:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Register customers (emails will go to your verified address)</li>
                                <li>Generate QR codes (you'll receive them via email)</li>
                                <li>Test the scanner functionality</li>
                                <li>Track visits and rewards</li>
                                <li>Use the dashboard analytics</li>
                            </ul>
                            <p className="mt-4">
                                <strong>Manual workaround:</strong> You can forward the QR codes to customers manually,
                                or show them the QR code from the dashboard.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <a
                            href="/"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}