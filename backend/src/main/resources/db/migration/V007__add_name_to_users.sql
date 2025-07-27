
-- Add name column to users table (3 steps to handle existing data)

-- Step 1: Add column as nullable
ALTER TABLE tb_users ADD COLUMN name TEXT NULL;

-- Step 2: Update existing users with username as default name
UPDATE tb_users SET name = username WHERE name IS NULL;

-- Step 3: Make column NOT NULL after all values are populated
ALTER TABLE tb_users ALTER COLUMN name SET NOT NULL;
