-- Simple Wallet Database - Create Categories Table
-- V003__create_categories_table.sql

-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Create categories table
CREATE TABLE IF NOT EXISTS tb_categories (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON tb_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON tb_categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_category ON tb_categories(category);

-- Insert default categories
INSERT INTO tb_categories (category, type, user_id) VALUES
    ('Salary', 'INCOME', 'system'),
    ('Freelance', 'INCOME', 'system'),
    ('Investment', 'INCOME', 'system'),
    ('Food', 'EXPENSE', 'system'),
    ('Transport', 'EXPENSE', 'system'),
    ('Entertainment', 'EXPENSE', 'system'),
    ('Bills', 'EXPENSE', 'system'),
    ('Healthcare', 'EXPENSE', 'system'),
    ('Shopping', 'EXPENSE', 'system'),
    ('Education', 'EXPENSE', 'system')
ON CONFLICT DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Table tb_categories created successfully with default categories';
END $$;
