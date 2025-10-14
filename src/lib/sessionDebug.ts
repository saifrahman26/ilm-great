// Simple session debugging utility
export const SessionDebug = {
    logSessionInfo: () => {
        if (typeof window === 'undefined') return

        console.log('🔍 Session Debug Info:')
        console.log('- localStorage available:', !!window.localStorage)
        console.log('- sessionStorage available:', !!window.sessionStorage)

        try {
            const supabaseKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('sb-') || key.includes('supabase')
            )
            console.log('- Supabase keys in localStorage:', supabaseKeys.length)
            supabaseKeys.forEach(key => {
                const value = localStorage.getItem(key)
                console.log(`  - ${key}: ${value ? 'exists' : 'null'}`)
            })
        } catch (err) {
            console.log('- Error reading localStorage:', err)
        }
    },

    clearAllSessions: () => {
        if (typeof window === 'undefined') return

        try {
            const supabaseKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('sb-') || key.includes('supabase')
            )
            supabaseKeys.forEach(key => localStorage.removeItem(key))
            console.log('🧹 Cleared all Supabase session data')
        } catch (err) {
            console.error('Error clearing sessions:', err)
        }
    }
}