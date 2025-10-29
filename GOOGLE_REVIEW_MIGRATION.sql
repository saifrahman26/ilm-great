-- Add Google Review Link to Businesses Table
-- Run this SQL in your Supabase SQL Editor

-- Add google_review_link column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS google_review_link TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN businesses.google_review_link IS 'Google Review link for the business - customers will be redirected here after registration';

-- Optional: Create an index for faster queries (if you plan to filter by this field)
-- CREATE INDEX IF NOT EXISTS idx_businesses_google_review_link ON businesses(google_review_link);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name = 'google_review_link';