import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMessage } from '@/lib/messaging'

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
        const { businessId, title, message, targetFilter, customerIds } = await request.json()

        if (!businessId || !title || !message || !customerIds?.length) {
            return NextResponse.json(
                { error: 'Business ID, title, message, and customer IDs are required' },
                { status: 400 }
            )
        }

        console.log('📧 Starting offer campaign:', {
            businessId,
            title,
            targetFilter,
            customerCount: customerIds.length
        })

        // Check 24-hour rate limit for each customer
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: recentCampaigns, error: rateLimitError } = await supabaseAdmin
            .from('offer_campaigns')
            .select('customer_ids')
            .eq('business_id', businessId)
            .gte('created_at', twentyFourHoursAgo)

        if (rateLimitError) {
            console.error('❌ Rate limit check error:', rateLimitError)
        }

        // Get customers who received offers in last 24 hours
        const recentlyContactedIds = new Set()
        if (recentCampaigns) {
            recentCampaigns.forEach(campaign => {
                if (campaign.customer_ids) {
                    campaign.customer_ids.forEach((id: string) => recentlyContactedIds.add(id))
                }
            })
        }

        // Filter out customers who were contacted recently
        const eligibleCustomerIds = customerIds.filter((id: string) => !recentlyContactedIds.has(id))

        if (eligibleCustomerIds.length === 0) {
            return NextResponse.json(
                { error: 'All selected customers have received offers in the last 24 hours' },
                { status: 400 }
            )
        }

        if (eligibleCustomerIds.length < customerIds.length) {
            console.log(`⚠️ Rate limiting: ${customerIds.length - eligibleCustomerIds.length} customers skipped (24h limit)`)
        }

        // Get customer details for eligible customers
        const { data: customers, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('id, name, email, phone')
            .in('id', eligibleCustomerIds)

        if (customerError || !customers) {
            console.error('❌ Error fetching customers:', customerError)
            return NextResponse.json(
                { error: 'Failed to fetch customer details' },
                { status: 500 }
            )
        }

        // Get business details
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('name, phone, email')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            console.error('❌ Error fetching business:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        // Create campaign record
        const { data: campaign, error: campaignError } = await supabaseAdmin
            .from('offer_campaigns')
            .insert({
                business_id: businessId,
                title,
                message,
                target_filter: targetFilter,
                customer_ids: eligibleCustomerIds,
                sent_count: 0,
                status: 'sending'
            })
            .select()
            .single()

        if (campaignError) {
            console.error('❌ Error creating campaign:', campaignError)
            return NextResponse.json(
                { error: 'Failed to create campaign' },
                { status: 500 }
            )
        }

        // Send messages to customers
        let sentCount = 0
        let failedCount = 0
        const results = []

        for (const customer of customers) {
            try {
                // Personalize message
                const personalizedMessage = message
                    .replace(/\{name\}/g, customer.name)
                    .replace(/\{business\}/g, business.name)

                // Add business signature
                const fullMessage = `${personalizedMessage}\n\n- ${business.name}`

                // Send via WhatsApp if phone available, otherwise email
                let sent = false
                if (customer.phone) {
                    try {
                        await sendMessage(customer.phone, fullMessage, 'whatsapp')
                        sent = true
                        console.log(`✅ WhatsApp sent to ${customer.name} (${customer.phone})`)
                    } catch (whatsappError) {
                        console.log(`⚠️ WhatsApp failed for ${customer.name}, trying email...`)
                    }
                }

                if (!sent && customer.email) {
                    try {
                        await sendMessage(customer.email, fullMessage, 'email', title)
                        sent = true
                        console.log(`✅ Email sent to ${customer.name} (${customer.email})`)
                    } catch (emailError) {
                        console.log(`❌ Email failed for ${customer.name}`)
                    }
                }

                if (sent) {
                    sentCount++
                    results.push({ customerId: customer.id, status: 'sent' })
                } else {
                    failedCount++
                    results.push({ customerId: customer.id, status: 'failed' })
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (error) {
                console.error(`❌ Error sending to customer ${customer.id}:`, error)
                failedCount++
                results.push({ customerId: customer.id, status: 'failed' })
            }
        }

        // Update campaign with results
        const finalStatus = sentCount > 0 ? (failedCount === 0 ? 'sent' : 'partial') : 'failed'

        await supabaseAdmin
            .from('offer_campaigns')
            .update({
                sent_count: sentCount,
                failed_count: failedCount,
                status: finalStatus,
                results
            })
            .eq('id', campaign.id)

        console.log('✅ Campaign completed:', {
            campaignId: campaign.id,
            sentCount,
            failedCount,
            status: finalStatus
        })

        return NextResponse.json({
            success: true,
            campaignId: campaign.id,
            sentCount,
            failedCount,
            skippedCount: customerIds.length - eligibleCustomerIds.length,
            message: `Campaign sent successfully! ${sentCount} messages delivered${failedCount > 0 ? `, ${failedCount} failed` : ''
                }${customerIds.length - eligibleCustomerIds.length > 0 ?
                    `, ${customerIds.length - eligibleCustomerIds.length} skipped (24h limit)` : ''
                }`
        })

    } catch (error) {
        console.error('❌ Send offer campaign error:', error)
        return NextResponse.json(
            { error: 'Failed to send offer campaign' },
            { status: 500 }
        )
    }
}