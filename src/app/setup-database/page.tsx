'use client'

import { useState } from 'react'
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function SetupDatabase() {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [error, setError] = useState('')

    const runMigration = async () => {
        setIsRunning(true)
        setError('')
        setResults([])

        try {
            const response = await fetch('/api/setup-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (data.success) {
                setResults(data.results || [])
            } else {
                setError(data.error || 'Migration failed')
            }
        } catch (err) {
            setError('Failed to run migration: ' + (err instanceof Error ? err.message : 'Unknown error'))
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center mb-6">
                        <Database className="w-8 h-8 text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
                    </div>

                    <div className="mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <div className="flex">
                                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800">Database Migration Required</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Your database is missing some columns needed for the new features.
                                        Click the button below to add them automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4">
                            This will add the following columns to your businesses table:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
                            <li><code>inactive_customer_message</code> - Custom message for inactive customers</li>
                            <li><code>inactive_days_threshold</code> - Days before customer is considered inactive</li>
                            <li><code>reward_expires</code> - Whether rewards expire</li>
                            <li><code>reward_expiry_months</code> - How many months before rewards expire</li>
                        </ul>
                    </div>

                    <button
                        onClick={runMigration}
                        disabled={isRunning}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isRunning ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Running Migration...
                            </>
                        ) : (
                            <>
                                <Database className="w-4 h-4 mr-2" />
                                Run Database Migration
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <XCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Migration Failed</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                    <div className="mt-3 text-sm text-red-700">
                                        <p className="font-medium">Manual Setup Required:</p>
                                        <ol className="list-decimal list-inside mt-2 space-y-1">
                                            <li>Go to your Supabase project dashboard</li>
                                            <li>Open the SQL Editor</li>
                                            <li>Copy and paste the content from <code>MIGRATION_SCRIPT.sql</code></li>
                                            <li>Run the script</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Migration Results</h3>
                            <div className="space-y-2">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center p-3 rounded-md ${result.success
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-red-50 border border-red-200'
                                            }`}
                                    >
                                        {result.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 mr-2" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {result.query}
                                            </p>
                                            {result.error && (
                                                <p className="text-sm text-red-700 mt-1">{result.error}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {results.every(r => r.success) && (
                                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex">
                                        <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium text-green-800">Migration Completed Successfully!</h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                All database columns have been added. You can now use all the new features.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <a
                            href="/rewards"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            ← Back to Rewards Setup
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}