import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('courses')
    .update({ phone: null })
    .ilike('phone', 'none')
    .select('name')
  if (error) throw error
  console.log('Cleared "none" phones:', data?.map((c: { name: string }) => c.name))
}
main().catch(console.error)
