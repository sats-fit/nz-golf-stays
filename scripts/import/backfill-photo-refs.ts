/**
 * One-time: fetches photo_references from Google Places and stores them in the DB.
 * After this runs, the photo API route can skip the place/details call entirely.
 *
 * Run: npx ts-node --project tsconfig.json scripts/import/backfill-photo-refs.ts
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

async function getPhotoRefs(placeId: string): Promise<string[]> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=photos&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { photos?: { photo_reference: string }[] }; status: string }
  if (data.status !== 'OK') return []
  return (data.result?.photos ?? []).slice(0, 3).map(p => p.photo_reference)
}

async function main() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, google_place_id, photo_references')
    .not('google_place_id', 'is', null)
    .is('photo_references', null)

  if (error) throw error
  console.log(`Courses needing photo references: ${courses!.length}`)

  let updated = 0
  for (const course of courses!) {
    await sleep(150)
    const refs = await getPhotoRefs(course.google_place_id!)
    if (refs.length === 0) {
      process.stdout.write(`- ${course.name}: no photos\n`)
      continue
    }
    const { error: err } = await supabase
      .from('courses')
      .update({ photo_references: refs })
      .eq('id', course.id)
    if (err) {
      console.log(`✗ ${course.name}: ${err.message}`)
    } else {
      process.stdout.write(`✓ ${course.name}: ${refs.length} refs\n`)
      updated++
    }
  }
  console.log(`\nDone. Stored refs for ${updated} courses.`)
}

main().catch(console.error)
