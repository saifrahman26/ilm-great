import { supabase } from './supabase'

export class SessionUtils {
    /**
     * Clear all session data and cookies
     */
    static async clearAllSessionData(): Promise<void> {
        try {
            console.log('🧹 Clearing all session data...')

            // 1. Sign out from Supabase
            await supabase.auth.signOut()

            // 2. Clear localStorage and sessionStorage
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()

                // Clear specific Supabase keys that might persist
                const supabaseKeys = [
                    'supabase.auth.token',
                    'sb-wkiopowmbqzvhxlpxkfb-auth-token',
                    'supabase.auth.refreshToken',
                    'supabase.auth.user',
                    'supabase.session'
                ]

                supabaseKeys.forEach(key => {
                    localStorage.removeItem(key)
                    sessionStorage.removeItem(key)
                })
            }

            // 3. Clear cookies (client-side)
            if (typeof document !== 'undefined') {
                const cookies = document.cookie.split(";")
                cookies.forEach(cookie => {
                    const eqPos = cookie.indexOf("=")
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
                })
            }

            console.log('✅ Session data cleared successfully')
        } catch (error) {
            console.error('❌ Error clearing session data:', error)
            throw error
        }
    }

    /**
     * Check if session is stale or corrupted
     */
    static async isSessionStale(): Promise<boolean> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.log('⚠️ Session error detected:', error.message)
                return true
            }

            if (!session) {
                return false // No session is fine
            }

            // Check if session is expired
            const now = new Date().getTime() / 1000
            if (session.expires_at && session.expires_at < now) {
                console.log('⚠️ Session expired')
                return true
            }

            // Try to refresh the session
            const { error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
                console.log('⚠️ Session refresh failed:', refreshError.message)
                return true
            }

            return false
        } catch (error) {
            console.error('❌ Error checking session:', error)
            return true // Assume stale on error
        }
    }

    /**
     * Force refresh the current page after clearing session
     */
    static forceRefresh(): void {
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }

    /**
     * Get session debug info
     */
    static getSessionDebugInfo(): any {
        if (typeof window === 'undefined') return null

        return {
            localStorage: {
                keys: Object.keys(localStorage),
                supabaseKeys: Object.keys(localStorage).filter(key => key.includes('supabase'))
            },
            sessionStorage: {
                keys: Object.keys(sessionStorage),
                supabaseKeys: Object.keys(sessionStorage).filter(key => key.includes('supabase'))
            },
            cookies: document.cookie.split(';').map(c => c.trim().split('=')[0])
        }
    }
}