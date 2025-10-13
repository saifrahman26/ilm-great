import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for database operations
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
        const { customerId, qrData } = await request.json()

        if (!customerId && !qrData) {
            return NextResponse.json(
                { error: 'Customer ID or QR data is required' },
                { status: 400 }
            )
        }

        console.log('🔍 Looking up customer:', { customerId, qrData })

        // Fetch customer data - either by ID or QR data
        let customer, customerError

        if (customerId) {
            const result = await supabaseAdmin
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single()
            customer = result.data
            customerError = result.error
        } else if (qrData) {
            const result = await supabaseAdmin
                .from('customers')
                .select('*')
                .eq('qr_data', qrData)
                .single()
            customer = result.data
            customerError = result.error

            // If not found by qr_data, try to extract phone from QR data and search
            if (customerError && qrData.includes('-')) {
                const parts = qrData.split('-')
                if (parts.length >= 2) {
                    const phone = parts[1]
                    console.log('🔍 Trying phone lookup:', phone)
                    const phoneResult = await supabaseAdmin
                        .from('customers')
                        .select('*')
                        .eq('phone', phone)
                        .single()
                    customer = phoneResult.data
                    customerError = phoneResult.error
                }
            }
        }

        if (customerError || !customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Fetch business data
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', customer.business_id)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        console.log('✅ Customer found:', { id: customer.id, name: customer.name, visits: customer.visits })

        // Record the visit in visits table
        const pointsEarned = 1 // Default points per visit
        console.log('📝 Recording visit for customer:', customer.id)
        const { error: visitError } = await supabaseAdmin
            .from('visits')
            .insert({
                customer_id: customer.id,
                business_id: customer.business_id,
                points_earned: pointsEarned,
                visit_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            })

        if (visitError) {
            console.error('❌ Error recording visit:', visitError)
            return NextResponse.json(
                { error: 'Failed to record visit', details: visitError.message },
                { status: 500 }
            )
        }

        console.log('✅ Visit recorded successfully')

        // Update customer record
        const newVisitCount = customer.visits + 1
        const newPoints = (customer.points || 0) + pointsEarned
        const visitGoal = business.visit_goal || 5
        const isRewardEarned = newVisitCount % visitGoal === 0

        console.log('Visit Logic:', {
            previousVisits: customer.visits,
            newVisitCount,
            visitGoal,
            remainder: newVisitCount % visitGoal,
            isRewardEarned
        })

        const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
                visits: newVisitCount,
                points: newPoints,
                last_visit: new Date().toISOString(),
            })
            .eq('id', customer.id)

        if (updateError) {
            console.error('Error updating customer:', updateError)
            return NextResponse.json(
                { error: 'Failed to update customer' },
                { status: 500 }
            )
        }

        // Handle reward if earned
        if (isRewardEarned) {
            console.log('🎉 REWARD EARNED!', {
                customerName: customer.name,
                newVisitCount,
                visitGoal,
                rewardTitle: business.reward_title
            })

            // Record reward redemption
            const { error: rewardError } = await supabaseAdmin
                .from('rewards')
                .insert({
                    customer_id: customer.id,
                    business_id: customer.business_id,
                    reward_title: business.reward_title,
                    points_used: visitGoal,
                    status: 'pending'
                })

            if (rewardError) {
                console.error('Error recording reward:', rewardError)
            }

            // Send reward notification
            if (customer.email) {
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                    console.log('📧 Sending reward email to:', customer.email)
                    await fetch(`${baseUrl}/api/send-message`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: customer.email,
                            customerName: customer.name,
                            points: pointsEarned,
                            totalPoints: newPoints,
                            businessName: business.name,
                            message: `🎉 Congratulations! You've completed ${newVisitCount} visits and earned your reward: ${business.reward_title}! ${business.reward_description} Show this email to claim your reward!`,
                            subject: `🎉 Reward Earned! ${business.reward_title} at ${business.name}`,
                            template: 'loyalty'
                        })
                    })
                } catch (emailError) {
                    console.error('Error sending reward email:', emailError)
                }
            }
        } else if (customer.email) {
            // Send visit confirmation (only if no reward was earned)
            const visitsInCurrentCycle = newVisitCount % visitGoal
            const visitsToNextReward = visitsInCurrentCycle === 0 ? visitGoal : visitGoal - visitsInCurrentCycle

            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                console.log('📧 Sending visit confirmation email to:', customer.email)
                await fetch(`${baseUrl}/api/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: customer.email,
                        customerName: customer.name,
                        currentVisits: newVisitCount,
                        visitGoal: visitGoal,
                        businessName: business.name,
                        message: `Thanks for visiting! You now have ${newVisitCount} total visits. You need ${visitsToNextReward} more visits to earn your next reward: ${business.reward_title}!`,
                        subject: `Visit #${newVisitCount} recorded at ${business.name}`,
                        template: 'visit-reminder'
                    })
                })
            } catch (emailError) {
                console.error('❌ Error sending visit confirmation:', emailError)
                console.error('Visit email error details:', emailError)
            }
        } else {
            console.log('⚠️ No customer email, skipping visit confirmation email')
        }

        // Return updated customer and business data
        const updatedCustomer = {
            ...customer,
            visits: newVisitCount,
            points: newPoints,
            last_visit: new Date().toISOString(),
        }

        return NextResponse.json({
            success: true,
            customer: updatedCustomer,
            business,
            visitRecorded: true,
            rewardEarned: isRewardEarned,
            pointsEarned
        })

    } catch (error) {
        console.error('Visit recording error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}