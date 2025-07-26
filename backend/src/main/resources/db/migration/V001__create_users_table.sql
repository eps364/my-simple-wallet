-- Simple Wallet Database - Create Users Table
-- V001__create_users_table.sql

-- Create users table
CREATE TABLE IF NOT EXISTS tb_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_parent FOREIGN KEY (parent_id) REFERENCES tb_users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON tb_users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON tb_users(email);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON tb_users(parent_id);

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Table tb_users created successfully';
END $$;
