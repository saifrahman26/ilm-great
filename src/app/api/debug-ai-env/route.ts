import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
        keyLength: process.env.OPENROUTER_API_KEY?.length || 0,
        keyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'Not found',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        siteName: process.env.NEXT_PUBLIC_SITE_NAME,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENROUTER') || key.includes('AI'))
    })
}