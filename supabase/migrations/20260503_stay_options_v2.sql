-- Stay-options v2: replace single pricing_type enum with multiple flat columns so a
-- course can offer several stay arrangements at once (e.g. free-with-greens AND pay-no-play).

-- 1. Drop legacy columns left over from initial schema (data was migrated to pricing_type
--    in 20260315_stay_options_redesign.sql; no app code references them now).
ALTER TABLE courses
  DROP COLUMN IF EXISTS stay_n_play,
  DROP COLUMN IF EXISTS stay_no_play,
  DROP COLUMN IF EXISTS stay_no_play_price,
  DROP COLUMN IF EXISTS ask_first;

DROP TYPE IF EXISTS stay_n_play_option;

-- 2. Add new flat stay-option columns.
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS free_with_green_fees   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stay_no_play_allowed   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stay_no_play_price     numeric,
  ADD COLUMN IF NOT EXISTS stay_no_play_unit      text,   -- per_night | per_person | per_vehicle | per_person_per_night
  ADD COLUMN IF NOT EXISTS stay_with_play_allowed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stay_with_play_price   numeric,
  ADD COLUMN IF NOT EXISTS stay_with_play_unit    text,
  ADD COLUMN IF NOT EXISTS donation_accepted      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS power_additional_cost  numeric,
  ADD COLUMN IF NOT EXISTS power_unit             text;   -- per_night | per_vehicle

-- 3. Best-effort backfill from the old pricing_type enum so existing courses keep their data.
UPDATE courses SET
  free_with_green_fees   = (pricing_type = 'free_with_green_fees'),
  stay_no_play_allowed   = (pricing_type IN ('per_vehicle','per_person','free','donation')),
  stay_no_play_unit      = CASE pricing_type
                              WHEN 'per_vehicle' THEN 'per_vehicle'
                              WHEN 'per_person'  THEN 'per_person'
                              ELSE NULL END,
  donation_accepted      = (pricing_type = 'donation');

-- pricing_type / pricing_amount / power_cost are intentionally LEFT IN PLACE for now.
-- A follow-up migration will drop them once all callers are confirmed migrated.
