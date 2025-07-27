-- Add name column to users table
ALTER TABLE tb_users ADD COLUMN name TEXT NOT NULL DEFAULT '';

-- Update existing users with a default name (can be customized later)  
UPDATE tb_users SET name = username WHERE name = '';
