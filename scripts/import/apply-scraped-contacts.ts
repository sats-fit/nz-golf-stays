/**
 * Applies contact info found via Chrome DevTools website scraping.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const updates: { name: string; email?: string; phone?: string }[] = [
  { name: 'Alexandra Golf Club',          email: 'info@alexandragolf.co.nz' },
  { name: 'Hauraki Golf Club',            email: 'bookings@haurakigolf.co.nz' },
  { name: 'Wairakei International Golf Course', email: 'info@wairakeigolf.co.nz' },
  { name: 'Walton Golf Club',             email: 'waltongolf@outlook.com' },
  { name: 'The Eagles Nest Hamilton',     email: 'hamilton@theeaglesnest.co.nz' },
  { name: 'Renner Park Golf Club',        email: 'manager@rennerparkgolf.co.nz' },
]

async function main() {
  for (const u of updates) {
    const patch: Record<string, string> = {}
    if (u.email) patch.email = u.email
    if (u.phone) patch.phone = u.phone

    const { error } = await supabase
      .from('courses')
      .update(patch)
      .eq('name', u.name)

    if (error) {
      console.log(`✗ ${u.name}: ${error.message}`)
    } else {
      const fields = Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', ')
      console.log(`✓ ${u.name} — ${fields}`)
    }
  }
  console.log('\nDone.')
}

main().catch(console.error)
