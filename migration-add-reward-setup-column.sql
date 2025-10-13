-- Migration: Add reward_setup_completed column to businesses table
-- Run this in your Supabase SQL editor if the column is missing

-- Check if column exists and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name = 'reward_setup_completed'
    ) THEN
        ALTER TABLE businesses 
        ADD COLUMN reward_setup_completed BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added reward_setup_completed column to businesses table';
    ELSE
        RAISE NOTICE 'Column reward_setup_completed already exists in businesses table';
    END IF;
END $$;

-- Check if setup_completed_at column exists and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name = 'setup_completed_at'
    ) THEN
        ALTER TABLE businesses 
        ADD COLUMN setup_completed_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added setup_completed_at column to businesses table';
    ELSE
        RAISE NOTICE 'Column setup_completed_at already exists in businesses table';
    END IF;
END $$;