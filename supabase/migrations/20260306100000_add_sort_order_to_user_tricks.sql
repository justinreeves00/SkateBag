-- Add sort_order and is_manually_sorted to user_tricks
ALTER TABLE user_tricks ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE user_tricks ADD COLUMN is_manually_sorted BOOLEAN DEFAULT FALSE;

-- Initialize sort_order for existing records
WITH ranked_tricks AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_num
  FROM user_tricks
)
UPDATE user_tricks
SET sort_order = ranked_tricks.row_num
FROM ranked_tricks
WHERE user_tricks.id = ranked_tricks.id;
