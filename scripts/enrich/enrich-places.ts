/**
 * Enriches courses with Google Place IDs using the Places Text Search API.
 * Run with: npx ts-node --project tsconfig.json scripts/enrich/enrich-places.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

async function findPlaceId(name: string, lat: number, lng: number): Promise<string | null> {
  const query = encodeURIComponent(`${name} New Zealand`)
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${query}&inputtype=textquery` +
    `&locationbias=circle:20000@${lat},${lng}` +
    `&fields=place_id,name` +
    `&key=${API_KEY}`

  const res = await fetch(url)
  const data = await res.json() as { candidates?: { place_id: string; name: string }[]; status: string; error_message?: string }

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error(`  API error: ${data.status}${data.error_message ? ` — ${data.error_message}` : ''}`)
    return null
  }

  if (data.candidates && data.candidates.length > 0) {
    console.log(`  Matched: "${data.candidates[0].name}" → ${data.candidates[0].place_id}`)
    return data.candidates[0].place_id
  }

  return null
}

async function main() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, lat, lng, google_place_id')
    .is('google_place_id', null)

  if (error) { console.error(error); process.exit(1) }
  if (!courses || courses.length === 0) { console.log('All courses already enriched.'); return }

  console.log(`Enriching ${courses.length} courses...\n`)

  for (const course of courses) {
    if (!course.lat || !course.lng) {
      console.log(`Skipping ${course.name} (no coordinates)`)
      continue
    }

    console.log(`Searching: ${course.name}`)
    const placeId = await findPlaceId(course.name, course.lat, course.lng)

    if (placeId) {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ google_place_id: placeId })
        .eq('id', course.id)

      if (updateError) console.error(`  Update failed:`, updateError)
      else console.log(`  Saved.\n`)
    } else {
      console.log(`  No match found.\n`)
    }

    // Stay within Places API rate limits
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('Done!')
}

main()
