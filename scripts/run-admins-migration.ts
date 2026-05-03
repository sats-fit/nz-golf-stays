import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Step 1: create the admins table
const createTable = await supabase.rpc('exec_sql' as any, {
  sql: `CREATE TABLE IF NOT EXISTS admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
  );`
})

if (createTable.error) {
  // exec_sql may not exist — try direct insert approach instead
  console.log('exec_sql not available, checking if table exists via insert...')
}

// Step 2: look up the user and insert
const { data: users, error: userError } = await supabase.auth.admin.listUsers()
if (userError) {
  console.error('Error listing users:', userError.message)
  process.exit(1)
}

const admin = users.users.find(u => u.email === 'andrew.cummins07@gmail.com')
if (!admin) {
  console.error('User andrew.cummins07@gmail.com not found')
  process.exit(1)
}

console.log('Found user:', admin.id, admin.email)

const { error: insertError } = await supabase
  .from('admins')
  .upsert({ user_id: admin.id }, { onConflict: 'user_id' })

if (insertError) {
  console.error('Insert error (table may not exist yet):', insertError.message)
  console.log('\nPlease run this SQL in the Supabase dashboard SQL editor:')
  console.log(`
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

INSERT INTO admins (user_id) VALUES ('${admin.id}')
ON CONFLICT DO NOTHING;
  `)
} else {
  console.log('Admin seeded successfully for', admin.email)
}
