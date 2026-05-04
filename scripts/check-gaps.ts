import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data } = await supabase
    .from('courses')
    .select('id, name, region, phone, email, website')
    .eq('approved', true)
    .order('name')

  const noWebsite = data!.filter(c => !c.website)
  const noPhone = data!.filter(c => !c.phone)
  const noEmail = data!.filter(c => !c.email)
  const allMissing = data!.filter(c => !c.website && !c.phone && !c.email)

  console.log(`Total courses:   ${data!.length}`)
  console.log(`Missing website: ${noWebsite.length}`)
  console.log(`Missing phone:   ${noPhone.length}`)
  console.log(`Missing email:   ${noEmail.length}`)
  console.log(`Missing all 3:   ${allMissing.length}`)

  const hasWebsite = data!.filter(c => c.website && (!c.phone || !c.email))
  console.log(`\nHas website, missing phone or email: ${hasWebsite.length}`)
  hasWebsite.forEach(c =>
    console.log(`  ${c.name}: ${c.website} | phone=${c.phone ?? 'MISSING'} email=${c.email ?? 'MISSING'}`)
  )

  // Save for Chrome scraping
  fs.writeFileSync('scripts/courses-gaps.json', JSON.stringify(data!.filter(c => !c.phone || !c.email || !c.website), null, 2))
  console.log(`\nSaved ${data!.filter(c => !c.phone || !c.email || !c.website).length} gap records to scripts/courses-gaps.json`)
}

main().catch(console.error)
