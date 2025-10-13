'use client'

import { useState } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { hasValidSupabaseConfig } from '@/lib/supabase'
import SetupInstructions from '@/components/SetupInstructions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const { signIn } = useAuth()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const { error } = await signIn(data.email, data.password)

            if (error) {
                // Provide more user-friendly error messages
                if (error.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please check your credentials and try again.')
                } else if (error.message.includes('Email not confirmed')) {
                    setError('Please check your email and click the confirmation link before signing in.')
                } else if (error.message.includes('Too many requests')) {
                    setError('Too many login attempts. Please wait a few minutes and try again.')
                } else {
                    setError(error.message)
                }
            } else {
                setSuccess('Login successful! Redirecting to dashboard...')
                setTimeout(() => router.push('/dashboard'), 1000)
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        }

        setLoading(false)
    }

    // Show setup instructions if Supabase is not configured
    if (!hasValidSupabaseConfig) {
        return <SetupInstructions />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                        <span className="text-white font-bold text-2xl">L</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your LoyalLink account
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Create one here
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-xl border border-gray-100 sm:px-10">
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    {...register('password')}
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link
                                    href="/forgot-password"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}