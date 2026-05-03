CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Seed with the app owner
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'andrew.cummins07@gmail.com'
ON CONFLICT DO NOTHING;
