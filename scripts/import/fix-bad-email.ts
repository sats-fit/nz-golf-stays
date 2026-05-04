import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  // Clear obviously wrong emails (image file extensions)
  const { data } = await supabase.from('courses').select('id, name, email').not('email', 'is', null)
  const bad = data!.filter(c => c.email && /\.(webp|png|jpg|gif|svg|jpeg)$/i.test(c.email))
  console.log('Bad emails:', bad.map(c => `${c.name}: ${c.email}`))
  for (const c of bad) {
    await supabase.from('courses').update({ email: null }).eq('id', c.id)
    console.log(`Cleared email for ${c.name}`)
  }
}
main().catch(console.error)
