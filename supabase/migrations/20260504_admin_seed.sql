-- Seed additional admins. Idempotent — only inserts if the user has signed up.
-- If a user hasn't signed in yet, this is a no-op; promote them via /account once they sign in.

INSERT INTO admins (user_id)
SELECT id FROM auth.users
WHERE email IN ('jr41052@gmail.com', 'richardcumminsnz@gmail.com')
ON CONFLICT DO NOTHING;
