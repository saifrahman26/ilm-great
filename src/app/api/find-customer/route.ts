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
        const { businessId, identifier } = await request.json()

        if (!businessId || !identifier) {
            return NextResponse.json(
                { error: 'Business ID and identifier (email/phone) are required' },
                { status: 400 }
            )
        }

        const searchTerm = identifier.trim().toLowerCase()

        // Search for customer by email or phone
        const { data: customers, error: searchError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .or(`email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)

        if (searchError) {
            console.error('Error searching customers:', searchError)
            return NextResponse.json(
                { error: 'Failed to search customers' },
                { status: 500 }
            )
        }

        // Find exact match first, then partial match
        let customer = customers?.find(c =>
            c.email?.toLowerCase() === searchTerm ||
            c.phone === searchTerm ||
            c.phone?.replace(/\D/g, '') === searchTerm.replace(/\D/g, '') // Remove non-digits for phone comparison
        )

        // If no exact match, try partial match
        if (!customer && customers && customers.length > 0) {
            customer = customers.find(c =>
                c.email?.toLowerCase().includes(searchTerm) ||
                c.phone?.includes(searchTerm)
            )
        }

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found. Please check the email or phone number.' },
                { status: 404 }
            )
        }

        // Get business information
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                visits: customer.visits,
                points: customer.points,
                last_visit: customer.last_visit
            },
            business: {
                id: business.id,
                name: business.name,
                reward_title: business.reward_title,
                reward_description: business.reward_description,
                visit_goal: business.visit_goal
            }
        })

    } catch (error) {
        console.error('Customer search error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}