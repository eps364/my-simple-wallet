-- Simple Wallet Database - Create Accounts Table
-- V002__create_accounts_table.sql

-- Create accounts table
CREATE TABLE IF NOT EXISTS tb_accounts (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    credit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    due_date INTEGER NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES tb_users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON tb_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_description ON tb_accounts(description);

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Table tb_accounts created successfully';
END $$;
