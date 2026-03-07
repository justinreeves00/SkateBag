-- Add sort_order to global tricks table
ALTER TABLE tricks ADD COLUMN sort_order INTEGER DEFAULT 999999;

-- Initialize sort_order for all tricks based on current difficulty/name order
WITH ranked_tricks AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (ORDER BY difficulty ASC, name ASC) as row_num
  FROM tricks
)
UPDATE tricks
SET sort_order = ranked_tricks.row_num
FROM ranked_tricks
WHERE tricks.id = ranked_tricks.id;
