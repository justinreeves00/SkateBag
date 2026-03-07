-- Add 'learning' to TrickStatus
ALTER TABLE user_tricks DROP CONSTRAINT IF EXISTS user_tricks_status_check;
ALTER TABLE user_tricks ADD CONSTRAINT user_tricks_status_check CHECK (status IN ('landed', 'locked', 'learning'));
