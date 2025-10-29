-- Migration: Add inactive customer engagement fields to businesses table
-- Run this in your Supabase SQL editor

-- Add inactive customer engagement columns
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS inactive_days_threshold INTEGER DEFAULT 14;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS inactive_customer_message TEXT;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS enable_inactive_emails BOOLEAN DEFAULT true;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_inactive_emails ON businesses(enable_inactive_emails);
CREATE INDEX IF NOT EXISTS idx_businesses_inactive_days ON businesses(inactive_days_threshold);

-- Add index on customers last_visit for efficient inactive customer queries
CREATE INDEX IF NOT EXISTS idx_customers_last_visit_business ON customers(business_id, last_visit);

-- Create table to track sent inactive emails (to avoid duplicates)
CREATE TABLE IF NOT EXISTS inactive_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_type TEXT DEFAULT 'inactive_reminder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for email logs
CREATE INDEX IF NOT EXISTS idx_inactive_email_logs_customer ON inactive_email_logs(customer_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_inactive_email_logs_business ON inactive_email_logs(business_id, sent_at);

-- Enable RLS for email logs
ALTER TABLE inactive_email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
CREATE POLICY "Users can view their business email logs" ON inactive_email_logs
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = id
    )
  );

CREATE POLICY "System can insert email logs" ON inactive_email_logs
  FOR INSERT WITH CHECK (true);

-- Update existing businesses to have default values
UPDATE businesses 
SET 
    inactive_days_threshold = CASE 
        WHEN business_category = 'cafe' THEN 7
        WHEN business_category = 'restaurant' THEN 14
        WHEN business_category = 'food_hall' THEN 10
        WHEN business_category = 'bakery' THEN 7
        WHEN business_category = 'salon' THEN 21
        WHEN business_category = 'beauty_parlor' THEN 21
        WHEN business_category = 'boutique' THEN 30
        WHEN business_category = 'mens_wear' THEN 30
        WHEN business_category = 'womens_wear' THEN 30
        WHEN business_category = 'retail_store' THEN 21
        WHEN business_category = 'pharmacy' THEN 14
        WHEN business_category = 'gym_fitness' THEN 7
        WHEN business_category = 'electronics' THEN 45
        WHEN business_category = 'jewelry' THEN 60
        WHEN business_category = 'automotive' THEN 90
        ELSE 14
    END,
    enable_inactive_emails = true
WHERE inactive_days_threshold IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('inactive_days_threshold', 'inactive_customer_message', 'enable_inactive_emails');

-- Show sample of updated data
SELECT 
    name, 
    business_category, 
    inactive_days_threshold, 
    enable_inactive_emails 
FROM businesses 
LIMIT 5;