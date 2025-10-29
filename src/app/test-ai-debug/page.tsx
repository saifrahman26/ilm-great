'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function TestAIDebug() {
    const [testing, setTesting] = useState(false)
    const [results, setResults] = useState<any>(null)

    const testAI = async () => {
        setTesting(true)
        try {
            const response = await fetch('/api/test-ai')
            const data = await response.json()
            setResults(data)
        } catch (error) {
            setResults({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setTesting(false)
        }
    }

    const testEnv = async () => {
        setTesting(true)
        try {
            const response = await fetch('/api/debug-ai-env')
            const data = await response.json()
            setResults({ ...results, envDebug: data })
        } catch (error) {
            setResults({
                ...results,
                envDebug: { error: error instanceof Error ? error.message : 'Unknown error' }
            })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">AI Debug Console</h1>
                                <p className="text-blue-100 mt-2">Test and debug AI integration</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4 mb-6">
                            <button
                                onClick={testAI}
                                disabled={testing}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {testing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Testing AI Service...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Test AI Service
                                    </>
                                )}
                            </button>

                            <button
                                onClick={testEnv}
                                disabled={testing}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {testing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Checking Environment...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Check Environment Variables
                                    </>
                                )}
                            </button>
                        </div>

                        {results && (
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        {results.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className={`font-medium ${results.success ? 'text-green-600' : 'text-red-600'}`}>
                                            {results.success ? 'AI Service Working' : 'AI Service Failed'}
                                        </span>
                                    </div>

                                    {results.debug && (
                                        <div className="bg-white p-4 rounded border">
                                            <h3 className="font-medium text-gray-900 mb-2">Debug Info:</h3>
                                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {JSON.stringify(results.debug, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {results.testMessage && (
                                        <div className="bg-white p-4 rounded border">
                                            <h3 className="font-medium text-gray-900 mb-2">AI Response:</h3>
                                            <p className="text-gray-700">{results.testMessage}</p>
                                        </div>
                                    )}

                                    {results.error && (
                                        <div className="bg-red-50 p-4 rounded border border-red-200">
                                            <h3 className="font-medium text-red-900 mb-2">Error:</h3>
                                            <p className="text-red-700">{results.error}</p>
                                        </div>
                                    )}

                                    {results.envDebug && (
                                        <div className="bg-white p-4 rounded border">
                                            <h3 className="font-medium text-gray-900 mb-2">Environment Debug:</h3>
                                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {JSON.stringify(results.envDebug, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}