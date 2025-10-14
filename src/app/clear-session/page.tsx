'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ClearSessionPage() {
    const [clearing, setClearing] = useState(false)
    const [result, setResult] = useState<string>('')

    const clearSession = async () => {
        setClearing(true)
        setResult('')

        try {
            // Clear Supabase session
            await supabase.auth.signOut()

            // Clear all localStorage
            localStorage.clear()

            // Clear all sessionStorage
            sessionStorage.clear()

            // Clear cookies (basic approach)
            document.cookie.split(";").forEach((c) => {
                const eqPos = c.indexOf("=")
                const name = eqPos > -1 ? c.substr(0, eqPos) : c
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
            })

            setResult('✅ Session cleared successfully! You can now refresh the page or navigate to login.')

            // Auto redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000)

        } catch (error) {
            setResult('❌ Error clearing session: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }

        setClearing(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    🔧 Clear Session
                </h1>

                <p className="text-gray-600 mb-6">
                    If you're experiencing loading issues, this will clear all session data and cookies.
                </p>

                <button
                    onClick={clearSession}
                    disabled={clearing}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {clearing ? 'Clearing...' : 'Clear Session & Cookies'}
                </button>

                {result && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${result.includes('✅')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {result}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        </div>
    )
}