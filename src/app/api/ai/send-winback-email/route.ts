import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiService } from '@/lib/ai'
import { sendEmail } from '@/lib/messaging'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: NextRequest) {
    try {
        const { customerId, businessId, specialOffer } = await request.json()

        if (!customerId || !businessId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID and Business ID are required' },
                { status: 400 }
            )
        }

        // Get customer data
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Get business data
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { success: false, error: 'Business not found' },
                { status: 404 }
            )
        }

        // Calculate days since last visit
        const daysSinceLastVisit = customer.last_visit
            ? Math.floor((Date.now() - new Date(customer.last_visit).getTime()) / (1000 * 60 * 60 * 24))
            : 60

        // Generate AI-powered win-back email
        const aiResponse = await aiService.generateWinBackEmail({
            businessName: business.name,
            businessType: business.business_type,
            customerName: customer.name,
            visitCount: customer.visit_count || 0,
            visitGoal: business.visit_goal || 5,
            rewardTitle: business.reward_title,
            daysSinceLastVisit,
            specialOffer: specialOffer || '20% off your next visit'
        })

        let emailContent = ''
        if (aiResponse.success && aiResponse.content) {
            emailContent = aiResponse.content
        } else {
            // Fallback content
            emailContent = `We miss you at ${business.name}, ${customer.name}! 💙 It's been ${daysSinceLastVisit} days since your last visit. Come back and continue your journey to earn your ${business.reward_title}! ${specialOffer ? `Plus, enjoy ${specialOffer} on your return visit!` : ''} We can't wait to see you again! ✨`
        }

        // Create email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You - ${business.name}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">💙 We Miss You!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${business.name}</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        ${specialOffer ? `
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #0c5460; margin: 0 0 10px 0;">🎯 Special Welcome Back Offer!</h2>
            <p style="margin: 0; color: #0c5460; font-weight: bold; font-size: 18px;">${specialOffer}</p>
        </div>
        ` : ''}
        
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            ${emailContent}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; display: inline-block;">
                <h3 style="margin: 0 0 10px 0; color: #495057;">Your Progress</h3>
                <p style="margin: 0; font-size: 16px; color: #6c757d;">${customer.visit_count} of ${business.visit_goal} visits</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #28a745;">Next reward: ${business.reward_title}</p>
            </div>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Last visit:</strong> ${daysSinceLastVisit} days ago
            </p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>Powered by 🔗 LoyalLink - Making loyalty simple and rewarding</p>
    </div>
</body>
</html>`

        // Send email
        const emailSent = await sendEmail(
            customer,
            `💙 We miss you at ${business.name}! ${specialOffer ? '+ Special offer inside' : ''}`,
            emailHtml
        )

        if (!emailSent) {
            return NextResponse.json(
                { success: false, error: 'Failed to send email' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Win-back email sent successfully',
            emailContent: aiResponse.success ? emailContent : 'Fallback content used',
            isAIGenerated: aiResponse.success
        })

    } catch (error) {
        console.error('Win-back email error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}