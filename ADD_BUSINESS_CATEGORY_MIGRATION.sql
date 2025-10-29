-- Migration: Add business_category column to businesses table
-- Run this in your Supabase SQL editor

-- Add business_category column to businesses table
ALTER TABLE businesses 
ADD COLUMN business_category TEXT;

-- Add custom_category column for "other" category types
ALTER TABLE businesses 
ADD COLUMN custom_category TEXT;

-- Update existing businesses to have a default category (optional)
-- You can run this if you want to set existing businesses to a default category
-- UPDATE businesses SET business_category = 'retail_store' WHERE business_category IS NULL;

-- Add index for better performance on category queries
CREATE INDEX idx_businesses_category ON businesses(business_category);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('business_category', 'custom_category');