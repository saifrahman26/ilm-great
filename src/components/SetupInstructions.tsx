import { AlertCircle, Database, MessageSquare, Mail } from 'lucide-react'

export default function SetupInstructions() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Setup Required
                        </h1>
                        <p className="text-gray-600">
                            Please configure your environment variables to get started with LoyalLink
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center mb-2">
                                <Database className="w-5 h-5 text-blue-500 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">1. Supabase Setup</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Create a Supabase project and get your credentials:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-4">
                                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create a new project</li>
                                <li>Go to Settings → API and copy your Project URL and anon public key</li>
                                <li>Go to SQL Editor and run the schema from <code className="bg-gray-100 px-1 rounded">supabase-schema.sql</code></li>
                            </ol>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                            <div className="flex items-center mb-2">
                                <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">2. WhatsApp Setup (Optional)</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Set up WhatsApp messaging with UltraMsg:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-4">
                                <li>Sign up at <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ultramsg.com</a></li>
                                <li>Create a new instance and connect your WhatsApp</li>
                                <li>Copy your Instance ID and Token</li>
                            </ol>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                            <div className="flex items-center mb-2">
                                <Mail className="w-5 h-5 text-purple-500 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">3. Email Setup (Optional)</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Set up email messaging with Resend:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-4">
                                <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com</a></li>
                                <li>Create an API key</li>
                                <li>Verify your domain (or use test domain)</li>
                            </ol>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Environment Variables</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file with:
                            </p>
                            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                {`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WhatsApp (Optional)
ULTRAMSG_INSTANCE_ID=your_instance_id
ULTRAMSG_TOKEN=your_ultramsg_token

# Email (Optional)
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
                            </pre>
                        </div>

                        <div className="text-center space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Refresh After Setup
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-2">Or try the demo version:</p>
                                <button
                                    onClick={() => {
                                        localStorage.setItem('demo-mode', 'true')
                                        window.location.reload()
                                    }}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Try Demo Mode
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    Demo mode uses sample data and doesn't require Supabase setup
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}