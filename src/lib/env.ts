// Environment variable loader with fallbacks
export const getOpenRouterApiKey = (): string => {
    // Always return the hardcoded key for now to ensure it works
    const hardcodedKey = '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'

    // Try environment first
    const envKey = process.env.OPENROUTER_API_KEY

    if (envKey && envKey !== '') {
        console.log('✅ OpenRouter API key loaded from environment')
        return envKey
    }

    console.warn('⚠️ Using hardcoded OpenRouter API key')
    return hardcodedKey
}

export const getSiteConfig = () => ({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://linkloyal.vercel.app',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'LinkLoyal'
})