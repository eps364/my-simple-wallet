-- Simple Wallet Database - Insert Initial Data
-- V005__insert_initial_data.sql

-- Insert default admin user (password: admin123)
INSERT INTO tb_users (id, username, password, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin', '$2a$10$N6YnL8.t5e9MkL9QU3M8Qe5K7vY.VpB.3M9WzA1sF8gQ2N4R6X8Em', 'admin@simplewallet.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample user (password: user123)
INSERT INTO tb_users (id, username, password, email) VALUES
    ('00000000-0000-0000-0000-000000000002', 'user', '$2a$10$M5ZnL8.t5e9MkL9QU3M8Qe5K7vY.VpB.3M9WzA1sF8gQ2N4R6X8Em', 'user@simplewallet.com')
ON CONFLICT (username) DO NOTHING;

-- Insert default account for admin user
INSERT INTO tb_accounts (description, balance, credit, due_date, user_id) VALUES
    ('Main Account', 1000.00, 500.00, 15, '00000000-0000-0000-0000-000000000001'),
    ('Savings Account', 5000.00, 0.00, 1, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert default account for sample user
INSERT INTO tb_accounts (description, balance, credit, due_date, user_id) VALUES
    ('Personal Account', 500.00, 200.00, 10, '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Initial data inserted successfully';
    RAISE NOTICE 'Default users: admin (admin@simplewallet.com), user (user@simplewallet.com)';
    RAISE NOTICE 'Default password for both users: check documentation';
END $$;
