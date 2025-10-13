-- Migration to clear default rewards and add setup tracking
-- Run this to update existing businesses

-- First add the setup tracking columns if they don't exist
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

-- Clear default rewards for all businesses
-- This will make the popup show for everyone until they set up rewards
UPDATE businesses 
SET 
    reward_title = '',
    reward_description = '',
    reward_setup_completed = FALSE,
    setup_completed_at = NULL
WHERE reward_title = 'Free Coffee' 
   AND reward_description = 'Get a free coffee on us!'
   AND visit_goal = 5;

-- For businesses that have customized their rewards, mark them as completed
UPDATE businesses 
SET reward_setup_completed = TRUE,
    setup_completed_at = NOW()
WHERE (reward_title != '' AND reward_title IS NOT NULL)
  AND (reward_description != '' AND reward_description IS NOT NULL)
  AND reward_setup_completed = FALSE;