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

export async function POST(request: NextRequest) {
    try {
        const { businessId, identifier } = await request.json()

        if (!businessId || !identifier) {
            return NextResponse.json(
                { error: 'Business ID and identifier (email/phone) are required' },
                { status: 400 }
            )
        }

        console.log('🔍 Finding customer:', { businessId, identifier })

        // Enhanced search: support partial matching for phone, email, and name
        const searchTerm = identifier.trim().toLowerCase()

        console.log('🔍 Enhanced search for:', searchTerm)

        // Build flexible search query with enhanced matching
        const searchConditions = []

        // 1. Name matching (partial, case-insensitive) - most common search
        if (searchTerm.length >= 2) {
            searchConditions.push(`name.ilike.%${searchTerm}%`)
        }

        // 2. Email matching
        if (searchTerm.includes('@')) {
            // Exact email match
            searchConditions.push(`email.eq.${identifier}`)
            // Partial email match
            searchConditions.push(`email.ilike.%${searchTerm}%`)
        } else if (searchTerm.length >= 2) {
            // Partial email match for non-@ searches
            searchConditions.push(`email.ilike.%${searchTerm}%`)
        }

        // 3. Enhanced phone number matching
        const digitsOnly = searchTerm.replace(/\D/g, '')
        if (digitsOnly.length >= 2) {
            // Direct digit matching in phone field
            searchConditions.push(`phone.ilike.%${digitsOnly}%`)

            // Try with +91 prefix variations
            if (digitsOnly.length >= 3) {
                searchConditions.push(`phone.ilike.%+91${digitsOnly}%`)
                searchConditions.push(`phone.ilike.%91${digitsOnly}%`)
                searchConditions.push(`phone.ilike.%+91-${digitsOnly}%`)
                searchConditions.push(`phone.ilike.%+91 ${digitsOnly}%`)
            }

            // If it looks like a full phone number, try exact matches
            if (digitsOnly.length >= 10) {
                searchConditions.push(`phone.eq.${digitsOnly}`)
                searchConditions.push(`phone.eq.+91${digitsOnly}`)
                searchConditions.push(`phone.eq.+91-${digitsOnly}`)
                searchConditions.push(`phone.eq.+91 ${digitsOnly}`)
            }
        }

        console.log('🔍 Search conditions:', searchConditions)

        // Execute search with all conditions
        const { data: customers, error: searchError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .or(searchConditions.join(','))
            .limit(15) // Return up to 15 matches

        if (searchError) {
            console.error('❌ Error searching customers:', searchError)
            return NextResponse.json(
                { error: 'Failed to search customers' },
                { status: 500 }
            )
        }

        console.log('✅ Search results:', customers?.length || 0, 'customers found')

        if (!customers || customers.length === 0) {
            return NextResponse.json(
                { error: `No customers found matching "${identifier}"` },
                { status: 404 }
            )
        }

        // If multiple matches, return all of them for user to choose
        if (customers.length > 1) {
            console.log('✅ Multiple customers found, returning all matches')

            // Get business details
            const { data: business, error: businessError } = await supabaseAdmin
                .from('businesses')
                .select('*')
                .eq('id', businessId)
                .single()

            return NextResponse.json({
                success: true,
                multiple: true,
                customers,
                business,
                count: customers.length
            })
        }

        const customer = customers[0] // Single match

        // Get business details
        const { data: business, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single()

        if (businessError || !business) {
            console.error('❌ Error fetching business:', businessError)
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            )
        }

        console.log('✅ Customer found:', {
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            visits: customer.visits
        })

        return NextResponse.json({
            success: true,
            customer,
            business
        })

    } catch (error) {
        console.error('❌ Find customer error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}