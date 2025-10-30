import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const businessId = searchParams.get('businessId')

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            )
        }

        console.log('👥 Fetching customers for business:', businessId)

        // Fetch all customers for the business
        const { data: customers, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Error fetching customers:', error)
            return NextResponse.json(
                { error: 'Failed to fetch customers' },
                { status: 500 }
            )
        }

        // Calculate additional metrics for each customer
        const now = new Date()
        const enrichedCustomers = customers?.map(customer => {
            const lastVisit = customer.last_visit ? new Date(customer.last_visit) : null
            const daysSinceLastVisit = lastVisit
                ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
                : null

            // Determine if customer is active (visited in last 30 days)
            const isActive = daysSinceLastVisit !== null && daysSinceLastVisit <= 30

            return {
                ...customer,
                is_active: isActive,
                days_since_last_visit: daysSinceLastVisit
            }
        }) || []

        console.log('✅ Customers fetched:', enrichedCustomers.length)

        return NextResponse.json({
            success: true,
            customers: enrichedCustomers,
            stats: {
                total: enrichedCustomers.length,
                active: enrichedCustomers.filter(c => c.is_active).length,
                inactive: enrichedCustomers.filter(c => !c.is_active).length,
                highVisitors: enrichedCustomers.filter(c => c.visits >= 10).length,
                lowVisitors: enrichedCustomers.filter(c => c.visits >= 1 && c.visits <= 5).length,
                newCustomers: enrichedCustomers.filter(c => {
                    const createdAt = new Date(c.created_at)
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    return createdAt >= thirtyDaysAgo
                }).length
            }
        })

    } catch (error) {
        console.error('❌ Fetch customers error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}