/**
 * Backfills missing website + phone from Google Places for all courses.
 * Run: npx ts-node --project tsconfig.json scripts/import/backfill-contact.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function getDetails(placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=formatted_phone_number,website&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { formatted_phone_number?: string; website?: string } }
  return {
    phone: data.result?.formatted_phone_number ?? null,
    website: data.result?.website ?? null,
  }
}

async function main() {
  const { data: courses } = await supabase
    .from('courses')
    .select('id, name, phone, website, google_place_id')
    .not('google_place_id', 'is', null)

  const needsLookup = courses!.filter(c => !c.website || !c.phone)
  console.log(`Courses needing Google Places lookup: ${needsLookup.length}\n`)

  let updated = 0

  for (const course of needsLookup) {
    await sleep(150)
    const details = await getDetails(course.google_place_id!)

    const patch: Record<string, string> = {}
    if (!course.website && details.website) patch.website = details.website
    if (!course.phone && details.phone) patch.phone = details.phone

    if (Object.keys(patch).length === 0) continue

    const { error } = await supabase.from('courses').update(patch).eq('id', course.id)
    if (error) {
      console.log(`✗ ${course.name}: ${error.message}`)
    } else {
      const fields = Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', ')
      console.log(`✓ ${course.name} — ${fields}`)
      updated++
    }
  }

  console.log(`\nUpdated ${updated} courses from Google Places.`)
}

main().catch(console.error)
