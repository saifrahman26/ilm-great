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
        const { customerId, businessId } = await request.json()

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

        // Calculate pending rewards
        const earnedRewards = Math.floor((customer.visit_count || 0) / (business.visit_goal || 5))
        const claimedRewards = customer.rewards_claimed || 0
        const pendingRewards = earnedRewards - claimedRewards

        if (pendingRewards <= 0) {
            return NextResponse.json(
                { success: false, error: 'Customer has no pending rewards' },
                { status: 400 }
            )
        }

        // Calculate days since earned
        const daysSinceEarned = customer.last_visit
            ? Math.floor((Date.now() - new Date(customer.last_visit).getTime()) / (1000 * 60 * 60 * 24))
            : 30

        // Generate AI-powered reminder email
        const aiResponse = await aiService.generatePendingRewardReminder({
            businessName: business.name,
            businessType: business.business_type,
            customerName: customer.name,
            pendingRewards,
            rewardTitle: business.reward_title,
            daysSinceEarned
        })

        let emailContent = ''
        if (aiResponse.success && aiResponse.content) {
            emailContent = aiResponse.content
        } else {
            // Fallback content
            emailContent = `🎁 Hi ${customer.name}! You have ${pendingRewards} unclaimed reward${pendingRewards > 1 ? 's' : ''} waiting for you at ${business.name}! Come by soon to claim your ${business.reward_title}. We can't wait to see you! ✨`
        }

        // Create email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pending Reward Reminder - ${business.name}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎁 Reward Reminder</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${business.name}</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #856404; margin: 0 0 10px 0;">⏰ Don't Miss Out!</h2>
            <p style="margin: 0; color: #856404; font-weight: bold;">You have ${pendingRewards} unclaimed reward${pendingRewards > 1 ? 's' : ''} waiting!</p>
        </div>
        
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            ${emailContent}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; display: inline-block;">
                <h3 style="margin: 0 0 10px 0; color: #495057;">Your Reward Details</h3>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #28a745;">${business.reward_title}</p>
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">Show this email to claim</p>
            </div>
        </div>
        
        <div style="background: #e9ecef; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; color: #495057; font-size: 14px;">
                <strong>Visit Progress:</strong> ${customer.visit_count} visits completed
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
            `🎁 Your ${business.reward_title} is waiting at ${business.name}!`,
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
            message: 'Pending reward reminder sent successfully',
            emailContent: aiResponse.success ? emailContent : 'Fallback content used',
            isAIGenerated: aiResponse.success
        })

    } catch (error) {
        console.error('Pending reward reminder error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}