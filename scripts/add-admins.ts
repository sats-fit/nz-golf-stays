// Promote one or more emails to admins by upserting into the `admins` table.
// Usage: npx tsx scripts/add-admins.ts [email1 email2 ...]
// Defaults to seeding the two emails configured below if none passed.

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DEFAULT_EMAILS = ['jr41052@gmail.com', 'richardcumminsnz@gmail.com', 'andrew.cummins07@gmail.com']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const targets = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_EMAILS)
  .map(e => e.trim().toLowerCase())

async function run() {
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) {
    console.error('Failed to list users:', usersErr.message)
    process.exit(1)
  }

  for (const email of targets) {
    const user = usersData.users.find(u => u.email?.toLowerCase() === email)
    if (!user) {
      console.warn(`✗ ${email} — not found in auth.users (they need to sign in once first)`)
      continue
    }
    const { error } = await supabase
      .from('admins')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
    if (error) {
      console.error(`✗ ${email} — upsert failed: ${error.message}`)
    } else {
      console.log(`✓ ${email} (${user.id}) is now an admin`)
    }
  }
}

run()
