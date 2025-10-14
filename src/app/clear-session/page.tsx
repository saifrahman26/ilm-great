'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader, RefreshCw, CheckCircle } from 'lucide-react'

export default function ClearSessionPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing')
    const [message, setMessage] = useState('Clearing session data...')

    useEffect(() => {
        const clearSession = async () => {
            try {
                console.log('🧹 Clearing session data...')

                // 1. Sign out from Supabase
                await supabase.auth.signOut()

                // 2. Clear localStorage
                if (typeof window !== 'undefined') {
                    localStorage.clear()
                    sessionStorage.clear()

                    // Clear specific Supabase keys
                    const keysToRemove = [
                        'supabase.auth.token',
                        'sb-wkiopowmbqzvhxlpxkfb-auth-token',
                        'supabase.auth.refreshToken'
                    ]

                    keysToRemove.forEach(key => {
                        localStorage.removeItem(key)
                        sessionStorage.removeItem(key)
                    })
                }

                // 3. Clear cookies (client-side)
                if (typeof document !== 'undefined') {
                    document.cookie.split(";").forEach(function (c) {
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });
                }

                setStatus('success')
                setMessage('Session cleared successfully! Redirecting to login...')

                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/login')
                }, 2000)

            } catch (error) {
                console.error('❌ Error clearing session:', error)
                setStatus('error')
                setMessage('Error clearing session. Please try manually clearing your browser data.')
            }
        }

        clearSession()
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md mx-auto text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full">
                        {status === 'clearing' && (
                            <div className="bg-blue-100 w-full h-full rounded-full flex items-center justify-center">
                                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="bg-green-100 w-full h-full rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="bg-red-100 w-full h-full rounded-full flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 text-red-600" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {status === 'clearing' && 'Clearing Session'}
                        {status === 'success' && 'Session Cleared!'}
                        {status === 'error' && 'Clear Failed'}
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {status === 'error' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {status === 'clearing' && (
                        <div className="text-sm text-gray-500">
                            This may take a few seconds...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}