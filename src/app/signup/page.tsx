'use client'

import { useState } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useAuth } from '@/contexts/AuthContext'
import { hasValidSupabaseConfig, supabase } from '@/lib/supabase'
import SetupInstructions from '@/components/SetupInstructions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Upload, Building, Mail, Phone, Lock, User } from 'lucide-react'
import Logo from '@/components/Logo'


const signupSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    businessEmail: z.string().email({ message: 'Invalid business email address' }),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [signupComplete, setSignupComplete] = useState(false)
    const [userEmail, setUserEmail] = useState<string>('')
    const { signUp } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    })

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Logo file size must be less than 5MB')
                return
            }
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file')
                return
            }
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            setError('')
        }
    }

    const uploadLogo = async (businessId: string): Promise<string | null> => {
        if (!logoFile) return null

        setUploadingLogo(true)
        try {
            const fileExt = logoFile.name.split('.').pop()
            const fileName = `${businessId}/logo.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('business-logos')
                .upload(fileName, logoFile, {
                    upsert: true
                })

            if (uploadError) {
                console.error('Logo upload error:', uploadError)
                return null
            }

            const { data: publicUrlData } = supabase.storage
                .from('business-logos')
                .getPublicUrl(fileName)

            return publicUrlData.publicUrl
        } catch (error) {
            console.error('Logo upload failed:', error)
            return null
        } finally {
            setUploadingLogo(false)
        }
    }

    const onSubmit = async (data: SignupForm) => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // Step 1: Create the user account
            const { error } = await signUp(data.email, data.password, {
                name: data.businessName,
                email: data.businessEmail,
                phone: data.phone,
                reward_title: '', // No default reward
                reward_description: '',
                visit_goal: 5,
                reward_setup_completed: false, // Ensure setup is marked as incomplete
            })

            if (error) {
                // Provide more user-friendly error messages
                if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                    setError('An account with this email already exists. Please sign in instead.')
                } else if (error.message.includes('Password should be at least')) {
                    setError('Password must be at least 6 characters long.')
                } else if (error.message.includes('Invalid email')) {
                    setError('Please enter a valid email address.')
                } else if (error.message.includes('Too many requests') || error.message.includes('429')) {
                    setError('Too many signup attempts. Please wait a few minutes before trying again.')
                } else if (error.message.includes('Email rate limit exceeded')) {
                    setError('Email rate limit exceeded. Please wait before trying again.')
                } else if (error.message.includes('Signup is disabled')) {
                    setError('Account creation is temporarily disabled. Please try again later.')
                } else {
                    setError(`Account creation failed: ${error.message}`)
                }
                setLoading(false)
                return
            }

            // Step 2: Upload logo if provided
            let logoUrl = null
            if (logoFile) {
                // Get the current user to get their ID
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    logoUrl = await uploadLogo(user.id)

                    // Update business with logo URL
                    if (logoUrl) {
                        await supabase
                            .from('businesses')
                            .update({ business_logo_url: logoUrl })
                            .eq('id', user.id)
                    }
                }
            }

            // Check if email confirmation is required
            const { data: { user } } = await supabase.auth.getUser()
            const needsConfirmation = user && !user.email_confirmed_at

            if (needsConfirmation) {
                setSuccess('Account created successfully! Please check your email to confirm your account before signing in.')
            } else {
                setSuccess('Account created successfully! You can now sign in to your dashboard.')
            }

            setUserEmail(data.email)
            setSignupComplete(true)
            setLoading(false)

        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    // Show setup instructions if Supabase is not configured
    if (!hasValidSupabaseConfig) {
        return <SetupInstructions />
    }

    // Show success page after signup
    if (signupComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Logo size={80} showText={false} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            🎉 Account Created Successfully!
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Welcome to LoyalLink! Your business account has been created.
                        </p>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                    <div className="bg-white py-8 px-4 shadow-xl rounded-xl border border-gray-100 sm:px-10">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Check Your Email
                            </h3>
                            <p className="text-gray-600 mb-4">
                                We've sent a confirmation email to:
                            </p>
                            <p className="text-lg font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                                {userEmail}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-900 mb-2">📧 Next Steps:</h4>
                                <ol className="text-sm text-yellow-800 space-y-1">
                                    <li>1. Check your email inbox (and spam folder)</li>
                                    <li>2. Click the confirmation link in the email</li>
                                    <li>3. Return here and sign in to your account</li>
                                    <li>4. Set up your loyalty program rewards</li>
                                </ol>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">🚀 What's Next?</h4>
                                <p className="text-sm text-blue-800">
                                    Once you confirm your email and sign in, you'll be able to:
                                </p>
                                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                                    <li>• Configure your loyalty rewards</li>
                                    <li>• Add your first customers</li>
                                    <li>• Generate QR codes for visits</li>
                                    <li>• Track customer loyalty progress</li>
                                </ul>
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/login"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    Continue to Sign In
                                </Link>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => {
                                            setSignupComplete(false)
                                            setSuccess('')
                                            setError('')
                                        }}
                                        className="text-blue-600 hover:text-blue-500 underline"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo size={64} showText={true} textColor="text-gray-900" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Start your loyalty program
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create your LoyalLink business account
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow-xl rounded-xl border border-gray-100 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm">{error}</p>
                                        {error.includes('Too many') && (
                                            <p className="text-xs mt-2 text-red-500">
                                                💡 Tip: If you're testing, try waiting 5-10 minutes or use a different email address.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && !signupComplete && (
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Business Information Section */}
                        <div className="space-y-6">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                                    Business Information
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Tell us about your business</p>
                            </div>

                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                                    <Building className="w-4 h-4 inline mr-1" />
                                    Business Name *
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('businessName')}
                                        type="text"
                                        placeholder="Enter your business name"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                    />
                                    {errors.businessName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Business Email *
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('businessEmail')}
                                        type="email"
                                        placeholder="business@example.com"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                    />
                                    {errors.businessEmail && (
                                        <p className="mt-1 text-sm text-red-600">{errors.businessEmail.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Business Phone *
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        placeholder="+1234567890"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-1" />
                                    Business Logo (Optional)
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information Section */}
                        <div className="space-y-6 border-t pt-6">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Account Information
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Create your login credentials</p>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Login Email *
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('email')}
                                        type="email"
                                        autoComplete="email"
                                        placeholder="your@email.com"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This will be used to log into your account</p>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Password *
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('password')}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Create a secure password"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Confirm Password *
                                </label>
                                <div className="mt-1">
                                    <input
                                        {...register('confirmPassword')}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Confirm your password"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Next Steps Info */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                            <ol className="text-sm text-blue-800 space-y-1">
                                <li>1. Create your business account</li>
                                <li>2. Set up your loyalty program rewards</li>
                                <li>3. Start adding customers and tracking visits</li>
                            </ol>
                            <p className="text-xs text-blue-700 mt-3 border-t border-blue-200 pt-3">
                                💡 Having issues? Rate limits reset after a few minutes. Try using a different email if needed.
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || uploadingLogo}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    uploadingLogo ? 'Uploading logo...' : 'Creating account...'
                                ) : (
                                    'Create Business Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>


        </div>
    )
}