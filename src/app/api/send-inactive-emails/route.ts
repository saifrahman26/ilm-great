import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { aiService } from '@/lib/ai'

// Use service role key for admin operations
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
        console.log('🔄 Starting inactive customer email job...')

        // Get all businesses with inactive email enabled
        const { data: businesses, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('enable_inactive_emails', true)

        if (businessError) {
            console.error('Error fetching businesses:', businessError)
            return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
        }

        let totalEmailsSent = 0
        const results = []

        for (const business of businesses || []) {
            try {
                console.log(`📧 Processing business: ${business.name}`)

                const inactiveDays = business.inactive_days_threshold || 14
                const cutoffDate = new Date()
                cutoffDate.setDate(cutoffDate.getDate() - inactiveDays)

                // Find inactive customers
                const { data: inactiveCustomers, error: customerError } = await supabaseAdmin
                    .from('customers')
                    .select('*')
                    .eq('business_id', business.id)
                    .not('email', 'is', null)
                    .lt('last_visit', cutoffDate.toISOString())

                if (customerError) {
                    console.error(`Error fetching customers for ${business.name}:`, customerError)
                    continue
                }

                console.log(`Found ${inactiveCustomers?.length || 0} inactive customers for ${business.name}`)

                for (const customer of inactiveCustomers || []) {
                    try {
                        // Check if we've already sent an inactive email recently (within 7 days)
                        const recentEmailCheck = new Date()
                        recentEmailCheck.setDate(recentEmailCheck.getDate() - 7)

                        // You might want to add a table to track sent emails to avoid duplicates
                        // For now, we'll send to all inactive customers

                        let message = business.inactive_customer_message

                        // Generate AI message if no custom message is set
                        if (!message) {
                            message = await generateInactiveMessage(business, customer)
                        }

                        // Send the email
                        await sendInactiveCustomerEmail(business, customer, message)
                        totalEmailsSent++

                        console.log(`✅ Sent inactive email to ${customer.email}`)

                    } catch (emailError) {
                        console.error(`Failed to send email to ${customer.email}:`, emailError)
                    }
                }

                results.push({
                    businessName: business.name,
                    inactiveCustomers: inactiveCustomers?.length || 0,
                    emailsSent: inactiveCustomers?.length || 0
                })

            } catch (businessError) {
                console.error(`Error processing business ${business.name}:`, businessError)
                results.push({
                    businessName: business.name,
                    error: businessError instanceof Error ? businessError.message : 'Unknown error'
                })
            }
        }

        console.log(`🎉 Inactive email job completed. Total emails sent: ${totalEmailsSent}`)

        return NextResponse.json({
            success: true,
            totalEmailsSent,
            businessesProcessed: businesses?.length || 0,
            results
        })

    } catch (error) {
        console.error('Error in inactive email job:', error)
        return NextResponse.json(
            { error: 'Failed to process inactive emails' },
            { status: 500 }
        )
    }
}

async function generateInactiveMessage(business: any, customer: any): Promise<string> {
    const businessType = business.business_category === 'other' ? business.custom_category : business.business_category
    const offers = getCategoryOffers(business.business_category)
    const randomOffer = offers[Math.floor(Math.random() * offers.length)]

    const prompt = `Generate a warm, personalized re-engagement email message for ${customer.name}, an inactive customer of ${business.name} (a ${businessType} business).

Customer Details:
- Name: ${customer.name}
- Last Visit: ${new Date(customer.last_visit).toLocaleDateString()}
- Total Visits: ${customer.visits}

Business Details:
- Business: ${business.name}
- Type: ${businessType}
- Reward: ${business.reward_title} after ${business.visit_goal} visits
- Special Offer: ${randomOffer}

Create a 150-200 word message that:
- Addresses ${customer.name} personally
- Mentions they're missed and valued
- Includes the special offer: ${randomOffer}
- References their visit history positively
- Creates gentle urgency to return
- Ends with a warm call-to-action

Keep it friendly, personal, and not pushy.`

    try {
        const aiResponse = await aiService.generateWinBackEmail({
            businessName: business.name,
            businessType,
            customerName: customer.name,
            visitCount: customer.visits,
            visitGoal: business.visit_goal,
            rewardTitle: business.reward_title,
            daysSinceLastVisit: Math.floor((new Date().getTime() - new Date(customer.last_visit).getTime()) / (1000 * 60 * 60 * 24)),
            specialOffer: randomOffer
        })

        if (aiResponse.success && aiResponse.content) {
            return aiResponse.content
        } else {
            throw new Error(aiResponse.error || 'AI generation failed')
        }
    } catch (error) {
        console.error('Failed to generate AI message, using fallback:', error)
        return `Hi ${customer.name}! 👋

We miss seeing you at ${business.name}! It's been a while since your last visit, and we wanted to reach out because you're such a valued customer.

As a thank you for your loyalty, we'd love to welcome you back with a special offer: ${randomOffer}! 

Your ${customer.visits} previous visits mean so much to us, and we'd love to help you continue your journey toward earning your ${business.reward_title}.

Come visit us soon - we can't wait to see you again!

Warm regards,
The ${business.name} Team`
    }
}

async function sendInactiveCustomerEmail(business: any, customer: any, message: string) {
    const subject = `We miss you at ${business.name}! Special offer inside 🎁`

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .offer-box { background: #f8f9ff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>We Miss You! 💙</h1>
                <p>A special message from ${business.name}</p>
            </div>
            <div class="content">
                <div style="white-space: pre-line; margin-bottom: 20px;">
                    ${message}
                </div>
                
                <div class="offer-box">
                    <h3 style="color: #667eea; margin-top: 0;">🎁 Your Special Offer</h3>
                    <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">
                        Valid for your next visit!
                    </p>
                </div>

                <div style="text-align: center;">
                    <p><strong>Your Progress:</strong> ${customer.visits} visits completed</p>
                    <p>Only ${Math.max(0, business.visit_goal - customer.visits)} more visits until you earn: <strong>${business.reward_title}</strong></p>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent to ${customer.email} because you're a valued customer of ${business.name}.</p>
                <p>Contact us: ${business.email} | ${business.phone}</p>
            </div>
        </div>
    </body>
    </html>`

    await sendEmail(
        customer.email,
        subject,
        emailHtml,
        business.name
    )
}

// Category-specific offers (same as in generate-inactive-message)
function getCategoryOffers(category: string): string[] {
    const offerMap: Record<string, string[]> = {
        'cafe': ['20% off your next coffee', 'Buy one coffee, get one free', 'Free pastry with any drink purchase'],
        'restaurant': ['15% off your next meal', 'Free appetizer with entree purchase', 'Complimentary dessert with dinner'],
        'food_hall': ['20% off your next order', 'Free side with any main dish', '$5 off orders over $25'],
        'bakery': ['25% off fresh pastries', 'Free coffee with any pastry purchase', 'Buy 6 items, get 2 free'],
        'salon': ['20% off your next service', 'Free deep conditioning treatment', '15% off hair care products'],
        'beauty_parlor': ['25% off facial treatments', 'Free eyebrow threading with facial', '20% off beauty packages'],
        'boutique': ['30% off selected items', 'Buy 2, get 1 at 50% off', '25% off new arrivals'],
        'mens_wear': ['25% off suits and formal wear', 'Free tie with shirt purchase', '20% off accessories'],
        'womens_wear': ['30% off dresses and tops', 'Buy 2 items, get 1 at 50% off', '25% off seasonal collection'],
        'retail_store': ['20% off your entire purchase', 'Buy 3, pay for 2', '$10 off orders over $50'],
        'pharmacy': ['15% off health products', 'Buy 2 vitamins, get 1 free', '20% off personal care items'],
        'gym_fitness': ['Free personal training session', '50% off next month\'s membership', 'Free guest pass'],
        'electronics': ['15% off accessories', 'Free screen protector', '10% off your next gadget'],
        'jewelry': ['20% off fine jewelry', 'Free jewelry cleaning service', '25% off custom designs'],
        'automotive': ['20% off next service', 'Free car wash with oil change', '15% off parts']
    }

    return offerMap[category] || ['20% off your next purchase', 'Special discount just for you', 'Exclusive offer for valued customers']
}