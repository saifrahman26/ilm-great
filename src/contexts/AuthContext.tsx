'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Business, hasValidSupabaseConfig } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { SessionDebug } from '@/lib/sessionDebug'

interface AuthContextType {
    user: User | null
    business: Business | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, businessData: Omit<Business, 'id' | 'created_at'>) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentFetchUserId, setCurrentFetchUserId] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            if (!hasValidSupabaseConfig) {
                if (mounted) setLoading(false)
                return
            }

            try {
                // Get session with retry mechanism for better reliability
                let session = null
                let attempts = 0
                const maxAttempts = 3

                while (!session && attempts < maxAttempts) {
                    const { data: { session: currentSession }, error } = await supabase.auth.getSession()

                    if (error) {
                        console.error('❌ Session fetch error:', error)
                        break
                    }

                    session = currentSession
                    attempts++

                    if (!session && attempts < maxAttempts) {
                        // Wait a bit before retrying
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }

                if (!mounted) return

                console.log('🔍 Session check:', session ? `Found (attempt ${attempts})` : 'None')

                // Debug session storage
                if (!session) {
                    SessionDebug.logSessionInfo()
                }

                setUser(session?.user ?? null)

                if (session?.user) {
                    // Fetch business in background, don't block loading
                    fetchBusiness(session.user.id).catch(console.error)
                }

                setLoading(false)

            } catch (err) {
                console.error('❌ Auth init error:', err)
                if (mounted) {
                    setUser(null)
                    setBusiness(null)
                    setLoading(false)
                }
            }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            console.log('🔄 Auth change:', event)
            setUser(session?.user ?? null)

            if (session?.user) {
                fetchBusiness(session.user.id).catch(console.error)
            } else {
                setBusiness(null)
            }
        })

        initializeAuth()

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const fetchBusiness = async (userId: string) => {
        if (!userId || currentFetchUserId === userId) return

        setCurrentFetchUserId(userId)

        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', userId)
                .single()

            if (!error && data) {
                setBusiness(data)
            } else {
                setBusiness(null)
            }
        } catch (err) {
            setBusiness(null)
        } finally {
            setCurrentFetchUserId(null)
        }
    }

    const signIn = async (email: string, password: string) => {
        if (!hasValidSupabaseConfig) {
            return { error: new Error('Supabase configuration is missing. Please check your environment variables.') }
        }

        try {
            console.log('🔐 Attempting sign in for:', email)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('❌ Sign in error:', error)
            } else {
                console.log('✅ Sign in successful:', data.user?.id)
            }

            return { error }
        } catch (err) {
            console.error('❌ Sign in exception:', err)
            return { error: new Error('Failed to sign in. Please check your network connection.') }
        }
    }

    const signUp = async (email: string, password: string, businessData: Omit<Business, 'id' | 'created_at'>) => {
        if (!hasValidSupabaseConfig) {
            return { error: new Error('Supabase configuration is missing. Please check your environment variables.') }
        }

        try {
            console.log('🚀 Starting signup process - v2...')

            // Step 1: Sign up the user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) {
                console.error('❌ Auth signup error:', error)
                return { error }
            }

            if (!data.user) {
                console.error('❌ No user data returned')
                return { error: new Error('Failed to create user account') }
            }

            console.log('✅ User created:', data.user.id)

            // Step 2: Check if email confirmation is required
            const needsConfirmation = !data.session && data.user && !data.user.email_confirmed_at

            if (needsConfirmation) {
                console.log('📧 Email confirmation required - user will need to verify email')
            } else {
                // Wait for session to be established and retry if needed
                let session = data.session
                let retries = 0
                const maxRetries = 3

                while (!session && retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
                    const { data: sessionData } = await supabase.auth.getSession()
                    session = sessionData.session
                    retries++
                    console.log(`🔄 Session check attempt ${retries}:`, session ? 'Found' : 'Not found')
                }

                if (!session && !needsConfirmation) {
                    console.log('⚠️ Session not immediately available, but proceeding with business creation')
                }
            }

            // Step 3: Create business record using service role key for reliability
            console.log('🏢 Creating business record...')

            // Use a separate API call to create business to avoid RLS issues
            try {
                const response = await fetch('/api/create-business', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: data.user.id,
                        businessData: businessData
                    })
                })

                const result = await response.json()

                if (!response.ok) {
                    console.error('❌ Business creation API error:', result)

                    // If it's a duplicate key error, that's actually okay - user might be re-registering
                    if (result.error && result.error.includes('duplicate key')) {
                        console.log('✅ Business already exists, continuing...')
                    } else {
                        return { error: new Error(result.error || 'Failed to create business profile') }
                    }
                } else {
                    console.log('✅ Business created via API')
                }
            } catch (apiError) {
                console.error('❌ Business creation API failed, trying direct insert...')

                // Fallback: try direct insert
                const { error: businessError } = await supabase
                    .from('businesses')
                    .insert({
                        id: data.user.id,
                        ...businessData,
                    })

                if (businessError) {
                    // If it's a duplicate key error, that's actually okay
                    if (businessError.message.includes('duplicate key')) {
                        console.log('✅ Business already exists, continuing...')
                    } else {
                        console.error('❌ Direct business creation error:', businessError)
                        return { error: new Error(`Failed to create business profile: ${businessError.message}`) }
                    }
                }
            }

            // Step 4: Fetch the created business
            console.log('📊 Fetching business data...')
            await fetchBusiness(data.user.id)

            console.log('✅ Signup completed successfully')
            return { error: null }
        } catch (err) {
            console.error('❌ Signup error:', err)
            return { error: new Error('Failed to create account. Please try again.') }
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setBusiness(null)
        } catch (err) {
            console.error('Sign out error:', err)
        }
    }

    const value = {
        user,
        business,
        loading,
        signIn,
        signUp,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}