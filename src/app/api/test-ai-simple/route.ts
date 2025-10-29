import { NextResponse } from 'next/server'

export async function GET() {
    const apiKey = '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'

    try {
        console.log('🧪 Simple AI test starting...')

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
                        content: 'Generate a short, friendly message thanking John for visiting Durer Coffee Shop. He has 3 out of 5 visits needed for a free coffee reward.'
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        })

        console.log('📡 Response status:', response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API error:', errorText)

            return NextResponse.json({
                success: false,
                error: `API error (${response.status}): ${errorText}`,
                status: response.status
            })
        }

        const data = await response.json()
        console.log('✅ Response data:', data)

        const content = data.choices?.[0]?.message?.content

        if (!content) {
            return NextResponse.json({
                success: false,
                error: 'No content in response',
                fullResponse: data
            })
        }

        return NextResponse.json({
            success: true,
            message: 'AI is working perfectly!',
            aiResponse: content,
            model: 'minimax/minimax-m2:free',
            usage: data.usage
        })

    } catch (error) {
        console.error('💥 Test error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}