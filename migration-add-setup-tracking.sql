-- Migration to add setup tracking columns to existing businesses table
-- Run this if you have an existing database

-- Add the new columns if they don't exist
DO $$ 
BEGIN
    -- Add reward_setup_completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'businesses' AND column_name = 'reward_setup_completed') THEN
        ALTER TABLE businesses ADD COLUMN reward_setup_completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add setup_completed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'businesses' AND column_name = 'setup_completed_at') THEN
        ALTER TABLE businesses ADD COLUMN setup_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update existing businesses to mark setup as incomplete by default
-- This ensures they will see the setup popup
UPDATE businesses 
SET reward_setup_completed = FALSE 
WHERE reward_setup_completed IS NULL;

-- Optional: Mark businesses with custom rewards as completed
-- Uncomment the following lines if you want to automatically mark
-- businesses that have customized their rewards as completed

-- UPDATE businesses 
-- SET reward_setup_completed = TRUE,
--     setup_completed_at = NOW()
-- WHERE (reward_title != 'Free Coffee' 
--        OR reward_description != 'Get a free coffee on us!' 
--        OR visit_goal != 5)
--   AND reward_setup_completed = FALSE;