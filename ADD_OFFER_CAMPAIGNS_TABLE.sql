-- Create offer_campaigns table for marketing campaigns
CREATE TABLE IF NOT EXISTS offer_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_filter TEXT NOT NULL, -- 'all', 'active', 'inactive', 'high_visits', etc.
    customer_ids UUID[] NOT NULL, -- Array of customer IDs who received the offer
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'partial', 'failed')),
    results JSONB, -- Detailed results for each customer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_business_id ON offer_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_created_at ON offer_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_status ON offer_campaigns(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_offer_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_offer_campaigns_updated_at
    BEFORE UPDATE ON offer_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_offer_campaigns_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE offer_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access campaigns for their own business
CREATE POLICY offer_campaigns_business_access ON offer_campaigns
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE owner_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON offer_campaigns TO authenticated;
GRANT USAGE ON SEQUENCE offer_campaigns_id_seq TO authenticated;