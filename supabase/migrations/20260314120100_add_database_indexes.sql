-- Add database indexes for performance optimization

-- Index on user_tricks.user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_tricks_user_id ON user_tricks(user_id);

-- Index on user_tricks.trick_id for faster trick lookups
CREATE INDEX IF NOT EXISTS idx_user_tricks_trick_id ON user_tricks(trick_id);

-- Composite index for user-trick lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_user_tricks_user_trick ON user_tricks(user_id, trick_id);

-- Index on tricks.category for category filtering
CREATE INDEX IF NOT EXISTS idx_tricks_category ON tricks(category);

-- Index on tricks.difficulty for difficulty filtering
CREATE INDEX IF NOT EXISTS idx_tricks_difficulty ON tricks(difficulty);

-- Index on tricks.sort_order for ordering
CREATE INDEX IF NOT EXISTS idx_tricks_sort_order ON tricks(sort_order);

-- Index on admin_roles.user_id for role lookups
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);

-- Index on trick_suggestions.status for pending suggestion queries
CREATE INDEX IF NOT EXISTS idx_trick_suggestions_status ON trick_suggestions(status) WHERE status = 'pending';

-- Index on new_trick_suggestions.status for pending suggestion queries  
CREATE INDEX IF NOT EXISTS idx_new_trick_suggestions_status ON new_trick_suggestions(status) WHERE status = 'pending';

-- Add comments for documentation
COMMENT ON INDEX idx_user_tricks_user_id IS 'Optimizes queries filtering by user_id';
COMMENT ON INDEX idx_user_tricks_trick_id IS 'Optimizes queries filtering by trick_id';
COMMENT ON INDEX idx_user_tricks_user_trick IS 'Optimizes user-specific trick status lookups';
COMMENT ON INDEX idx_tricks_category IS 'Optimizes category filtering';
COMMENT ON INDEX idx_tricks_difficulty IS 'Optimizes difficulty filtering';
COMMENT ON INDEX idx_tricks_sort_order IS 'Optimizes trick ordering';
