-- Add new stay option columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pricing_type TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pricing_amount TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS power_cost TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS booking TEXT NOT NULL DEFAULT 'unknown';

-- Migrate existing data from old columns to new ones
UPDATE courses SET
  pricing_type = CASE
    WHEN stay_n_play = 'free_with_gf' THEN 'free_with_green_fees'
    WHEN stay_n_play = 'yes' AND stay_no_play = false THEN 'unknown'
    WHEN stay_no_play = true AND stay_no_play_price IS NOT NULL THEN 'per_vehicle'
    ELSE 'unknown'
  END,
  pricing_amount = CASE
    WHEN stay_no_play = true THEN stay_no_play_price
    ELSE NULL
  END,
  booking = CASE
    WHEN ask_first = true THEN 'ask_first'
    ELSE 'unknown'
  END;
