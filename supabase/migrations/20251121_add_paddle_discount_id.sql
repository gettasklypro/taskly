-- Add paddle_discount_id column to promo_codes table
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS paddle_discount_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_paddle_discount_id ON promo_codes(paddle_discount_id);
