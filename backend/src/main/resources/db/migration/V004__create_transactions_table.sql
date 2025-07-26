-- Simple Wallet Database - Create Transactions Table
-- V004__create_transactions_table.sql

-- Create transactions table
CREATE TABLE IF NOT EXISTS tb_transactions (
    id BIGSERIAL PRIMARY KEY,
    due_date DATE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    category_id BIGINT,
    account_id BIGINT,
    type transaction_type NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES tb_categories(id),
    CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES tb_accounts(id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES tb_users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON tb_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON tb_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON tb_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON tb_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON tb_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON tb_transactions(status);

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Table tb_transactions created successfully';
END $$;
