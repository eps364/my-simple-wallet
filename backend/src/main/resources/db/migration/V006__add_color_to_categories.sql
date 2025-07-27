-- Simple Wallet Database - Add Color Column to Categories Table
-- V006__add_color_to_categories.sql

-- Add color column to tb_categories table
ALTER TABLE tb_categories 
ADD COLUMN color VARCHAR(7);

-- Update existing categories with default colors
UPDATE tb_categories SET color = 
    CASE 
        WHEN category = 'Salary' THEN '#4ECDC4'
        WHEN category = 'Freelance' THEN '#45B7D1'
        WHEN category = 'Investment' THEN '#96CEB4'
        WHEN category = 'Food' THEN '#FF6B6B'
        WHEN category = 'Transport' THEN '#FFEAA7'
        WHEN category = 'Entertainment' THEN '#DDA0DD'
        WHEN category = 'Bills' THEN '#98D8C8'
        WHEN category = 'Healthcare' THEN '#F7DC6F'
        WHEN category = 'Shopping' THEN '#BB8FCE'
        WHEN category = 'Education' THEN '#85C1E9'
        ELSE '#45B7D1'
    END
WHERE user_id = 'system';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Color column added to tb_categories table with default values';
END $$;
