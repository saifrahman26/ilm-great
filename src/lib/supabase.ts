import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
export const hasValidSupabaseConfig = !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here')

// Create a mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
    const mockAuth = {
        signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
    }

    return {
        auth: mockAuth,
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
            insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
            update: () => ({ eq: () => ({ error: new Error('Supabase not configured') }) })
        }),
        storage: {
            from: () => ({
                upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        }
    } as any
}

// Create Supabase client with proper session storage configuration
export const supabase = hasValidSupabaseConfig
    ? createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    })
    : createMockClient()

// Database types
export interface Business {
    id: string
    name: string
    email: string
    phone: string
    website?: string
    description?: string
    reward_title: string
    reward_description: string
    visit_goal: number
    welcome_message?: string
    notification_email?: boolean
    notification_sms?: boolean
    business_logo_url?: string
    google_review_link?: string
    reward_setup_completed: boolean
    setup_completed_at?: string
    inactive_customer_message?: string
    inactive_days_threshold?: number
    reward_expires?: boolean
    reward_expiry_months?: number
    created_at: string
}

export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    email_confirmed: boolean
    visits: number
    points?: number
    last_visit: string
    qr_code_url?: string
    qr_data?: string
    business_id: string
    created_at: string
}

export interface Visit {
    id: string
    customer_id: string
    business_id: string
    points_earned: number
    visit_date: string
    notes?: string
    created_at: string
}

export interface Reward {
    id: string
    customer_id: string
    business_id: string
    reward_title: string
    points_used: number
    redeemed_at: string
    status: 'pending' | 'completed' | 'cancelled'
    created_at: string
}

export interface BusinessSettings {
    id: string
    business_id: string
    qr_code_data: string
    qr_code_url?: string
    points_per_visit: number
    email_notifications: boolean
    auto_rewards: boolean
    created_at: string
    updated_at: string
}