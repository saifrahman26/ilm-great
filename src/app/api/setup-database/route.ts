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
        const results = []

        // Add missing columns to businesses table
        const alterQueries = [
            {
                name: 'Add inactive_customer_message column',
                sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS inactive_customer_message TEXT;`
            },
            {
                name: 'Add inactive_days_threshold column',
                sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS inactive_days_threshold INTEGER DEFAULT 30;`
            },
            {
                name: 'Add reward_expires column',
                sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reward_expires BOOLEAN DEFAULT FALSE;`
            },
            {
                name: 'Add reward_expiry_months column',
                sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reward_expiry_months INTEGER DEFAULT 1;`
            }
        ]

        for (const query of alterQueries) {
            try {
                const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query.sql })
                if (error) {
                    console.log('Query error:', query.name, error)
                    results.push({ query: query.name, success: false, error: error.message })
                } else {
                    results.push({ query: query.name, success: true })
                }
            } catch (err) {
                console.log('Query exception:', query.name, err)
                results.push({ query: query.name, success: false, error: 'Query execution failed' })
            }
        }

        // Create rewards table if it doesn't exist
        const createRewardsTable = {
            name: 'Create rewards table',
            sql: `
                CREATE TABLE IF NOT EXISTS rewards (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
                    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
                    reward_title TEXT NOT NULL,
                    points_used INTEGER NOT NULL,
                    claim_token TEXT NOT NULL UNIQUE,
                    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    redeemed_at TIMESTAMP WITH TIME ZONE
                );
            `
        }

        try {
            const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createRewardsTable.sql })
            if (createError) {
                results.push({ query: createRewardsTable.name, success: false, error: createError.message })
            } else {
                results.push({ query: createRewardsTable.name, success: true })
            }
        } catch (err) {
            results.push({ query: createRewardsTable.name, success: false, error: 'Table creation failed' })
        }

        return NextResponse.json({
            success: true,
            message: 'Database setup completed',
            results
        })

    } catch (error) {
        console.error('Database setup error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Please run the migration script manually in Supabase SQL editor'
            },
            { status: 500 }
        )
    }
}