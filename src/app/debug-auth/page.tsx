'use client'

import { useAuth } from '@/contexts/AuthContext'
import { SessionDebug } from '@/lib/sessionDebug'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function DebugAuthPage() {
    const { user, business, loading } = useAuth()
    const [sessionInfo, setSessionInfo] = useState<any>(null)

    const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession()
        setSessionInfo({ data, error })
        SessionDebug.logSessionInfo()
    }

    const clearSessions = () => {
        SessionDebug.clearAllSessions()
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

                <div className="grid gap-6">
                    {/* Auth State */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
                        <div className="space-y-2">
                            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                            <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'None'}</p>
                            <p><strong>Business:</strong> {business ? `${business.name} (${business.id})` : 'None'}</p>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Session Information</h2>
                        <div className="space-y-4">
                            <button
                                onClick={checkSession}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Check Current Session
                            </button>

                            {sessionInfo && (
                                <div className="bg-gray-100 p-4 rounded">
                                    <pre className="text-sm overflow-auto">
                                        {JSON.stringify(sessionInfo, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Storage Debug */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Storage Debug</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => SessionDebug.logSessionInfo()}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
                            >
                                Log Storage Info
                            </button>

                            <button
                                onClick={clearSessions}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Clear All Sessions
                            </button>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p>Check the browser console for detailed storage information.</p>
                        </div>
                    </div>

                    {/* Browser Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
                            <p><strong>Cookies Enabled:</strong> {typeof window !== 'undefined' ? navigator.cookieEnabled ? 'Yes' : 'No' : 'N/A'}</p>
                            <p><strong>Local Storage:</strong> {typeof window !== 'undefined' && window.localStorage ? 'Available' : 'Not Available'}</p>
                            <p><strong>Session Storage:</strong> {typeof window !== 'undefined' && window.sessionStorage ? 'Available' : 'Not Available'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}