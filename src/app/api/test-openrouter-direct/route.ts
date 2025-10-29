import { NextResponse } from 'next/server'

export async function GET() {
    const apiKey = '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'

    try {
        console.log('🧪 Testing direct OpenRouter API call...')

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://linkloyal.vercel.app',
                'X-Title': 'LinkLoyal',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'minimax/minimax-m2:free',
                messages: [
                    {
                        role: 'user',
                        content: 'Say "Hello from LinkLoyal AI!" in a friendly way.'
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        })

        console.log('📡 OpenRouter response status:', response.status)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
            console.error('❌ OpenRouter API error:', errorData)

            return NextResponse.json({
                success: false,
                error: `OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`,
                status: response.status,
                errorData
            })
        }

        const data = await response.json()
        console.log('✅ OpenRouter response received:', data)

        const content = data.choices?.[0]?.message?.content

        return NextResponse.json({
            success: true,
            message: 'OpenRouter API is working!',
            aiResponse: content,
            fullResponse: data,
            apiKeyUsed: `${apiKey.substring(0, 15)}...`,
            model: 'minimax/minimax-m2:free'
        })

    } catch (error) {
        console.error('💥 Direct API test error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            apiKeyUsed: `${apiKey.substring(0, 15)}...`
        })
    }
}