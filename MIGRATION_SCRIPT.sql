-- Migration script to add missing columns to businesses table
-- Run this in your Supabase SQL editor

-- Add inactive customer message columns
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS inactive_customer_message TEXT,
ADD COLUMN IF NOT EXISTS inactive_days_threshold INTEGER DEFAULT 30;

-- Add reward expiration columns
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS reward_expires BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reward_expiry_months INTEGER DEFAULT 1;

-- Create rewards table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rewards_claim_token ON rewards(claim_token);
CREATE INDEX IF NOT EXISTS idx_rewards_business_id ON rewards(business_id);
CREATE INDEX IF NOT EXISTS idx_rewards_customer_id ON rewards(customer_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON rewards(status);

-- Enable RLS (Row Level Security) for rewards table
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rewards table
CREATE POLICY "Users can view their business rewards" ON rewards
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rewards for their business" ON rewards
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM businesses WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their business rewards" ON rewards
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM businesses WHERE id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON rewards TO authenticated;
GRANT ALL ON rewards TO service_role;