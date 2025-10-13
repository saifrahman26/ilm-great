'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [validToken, setValidToken] = useState<boolean | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    })

    useEffect(() => {
        const validateToken = async () => {
            // Check for custom token first
            const token = searchParams.get('token')

            if (token) {
                // Validate custom token
                const response = await fetch('/api/validate-reset-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                })

                if (response.ok) {
                    const { valid, email } = await response.json()
                    if (valid) {
                        setValidToken(true)
                        return
                    }
                }
            }

            // Check for Supabase tokens as fallback
            const accessToken = searchParams.get('access_token')
            const refreshToken = searchParams.get('refresh_token')
            const type = searchParams.get('type')

            if (type === 'recovery' && accessToken && refreshToken) {
                // Set the session with the tokens from the URL
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })

                if (!error) {
                    setValidToken(true)
                    return
                }
            }

            // If we get here, token is invalid
            setValidToken(false)
            setError('Invalid or expired reset link.')
        }

        validateToken()
    }, [searchParams])

    const onSubmit = async (data: ResetPasswordForm) => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const token = searchParams.get('token')

            if (token) {
                // Use custom token system
                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        password: data.password
                    }),
                })

                const result = await response.json()

                if (response.ok) {
                    setSuccess('Password updated successfully! Redirecting to login...')
                    setTimeout(() => router.push('/login'), 2000)
                } else {
                    setError(result.error || 'Failed to update password')
                }
            } else {
                // Use Supabase auth system as fallback
                const { error } = await supabase.auth.updateUser({
                    password: data.password
                })

                if (error) {
                    setError(error.message)
                } else {
                    setSuccess('Password updated successfully! Redirecting to login...')
                    setTimeout(() => router.push('/login'), 2000)
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        }

        setLoading(false)
    }

    if (validToken === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-600">Validating reset link...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (validToken === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Invalid Reset Link</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                This password reset link is invalid or has expired.
                            </p>
                            <div className="mt-6 space-y-3">
                                <Link
                                    href="/forgot-password"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Request New Reset Link
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Set new password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your new password below.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    {...register('password')}
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Enter your new password"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirm your new password"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}