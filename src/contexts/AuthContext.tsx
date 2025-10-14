'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Business, hasValidSupabaseConfig } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

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

    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            if (!hasValidSupabaseConfig) {
                if (mounted) setLoading(false)
                return
            }

            try {
                // Get initial session with timeout
                const sessionPromise = supabase.auth.getSession()
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
                )

                const { data: { session }, error } = await Promise.race([
                    sessionPromise,
                    timeoutPromise
                ]) as any

                if (!mounted) return

                if (error) {
                    console.error('❌ Session fetch error:', error)
                    setUser(null)
                    setBusiness(null)
                    setLoading(false)
                    return
                }

                console.log('🔍 Initial session check:', session ? 'Found session' : 'No session')
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchBusiness(session.user.id)
                } else {
                    setBusiness(null)
                }

                if (mounted) setLoading(false)

            } catch (err) {
                console.error('❌ Session initialization error:', err)
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

            console.log('🔄 Auth state change:', event, session ? 'with session' : 'no session')

            setUser(session?.user ?? null)

            if (session?.user) {
                await fetchBusiness(session.user.id)
            } else {
                setBusiness(null)
            }

            if (mounted) setLoading(false)
        })

        initializeAuth()

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const [currentFetchUserId, setCurrentFetchUserId] = useState<string | null>(null)

    const fetchBusiness = async (userId: string) => {
        if (!userId) {
            setBusiness(null)
            return
        }

        // Prevent multiple simultaneous fetches for the same user
        if (currentFetchUserId === userId) {
            console.log('🔄 Business fetch already in progress for user:', userId)
            return
        }

        setCurrentFetchUserId(userId)

        try {
            console.log('📊 Fetching business for user:', userId)

            // Simplified fetch without timeout to avoid issues
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('❌ Error fetching business:', error)
                if (error.code === 'PGRST116') {
                    console.log('⚠️ No business found for user (expected for new users)')
                } else {
                    console.error('Unexpected business fetch error:', error)
                }
                setBusiness(null)
                return
            }

            if (data) {
                console.log('✅ Business fetched:', data.name)
                setBusiness(data)
            } else {
                console.log('⚠️ No business data returned')
                setBusiness(null)
            }
        } catch (err) {
            console.error('❌ Business fetch exception:', err)
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
            console.log('🚀 Starting signup process...')

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
        await supabase.auth.signOut()
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