import { NextResponse } from 'next/server'

export async function GET() {
    const envKey = process.env.OPENROUTER_API_KEY
    const hardcodedKey = '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'

    return NextResponse.json({
        environment: {
            hasOpenRouterKey: !!envKey,
            keyLength: envKey?.length || 0,
            keyPrefix: envKey?.substring(0, 15) || 'Not found',
            keyMatches: envKey === hardcodedKey
        },
        hardcoded: {
            keyLength: hardcodedKey.length,
            keyPrefix: hardcodedKey.substring(0, 15)
        },
        config: {
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
            siteName: process.env.NEXT_PUBLIC_SITE_NAME,
            nodeEnv: process.env.NODE_ENV
        },
        allEnvKeys: Object.keys(process.env).filter(key =>
            key.includes('OPENROUTER') ||
            key.includes('AI') ||
            key.includes('NEXT_PUBLIC')
        ).sort(),
        totalEnvKeys: Object.keys(process.env).length
    })
}