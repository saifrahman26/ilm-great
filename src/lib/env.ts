// Environment variable loader with fallbacks
export const getOpenRouterApiKey = (): string => {
    // Try multiple sources for the API key
    const envKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_OPENROUTER_API_KEY

    if (envKey) {
        console.log('✅ OpenRouter API key loaded from environment')
        return envKey
    }

    // Fallback to hardcoded key
    const fallbackKey = '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'
    console.warn('⚠️ Using hardcoded OpenRouter API key as fallback')

    return fallbackKey
}

export const getSiteConfig = () => ({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://linkloyal.vercel.app',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'LinkLoyal'
})