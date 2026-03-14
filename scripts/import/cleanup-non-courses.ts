/**
 * Removes non-golf-course entries imported from Places API.
 * Uses Place Details types[] to confirm each is actually a golf_course.
 * Run with: npx ts-node --project tsconfig.json scripts/import/cleanup-non-courses.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

async function getTypes(placeId: string): Promise<string[]> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=types&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { types?: string[] }; status: string }
  return data.result?.types ?? []
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, google_place_id')
    .not('google_place_id', 'is', null)

  if (error) { console.error(error); process.exit(1) }
  if (!courses?.length) { console.log('No courses found.'); return }

  console.log(`Checking ${courses.length} courses for golf_course type...\n`)

  const toDelete: string[] = []

  for (const course of courses) {
    const types = await getTypes(course.google_place_id)
    const isGolfCourse = types.includes('golf_course')

    if (!isGolfCourse) {
      console.log(`✗ NOT a golf course: "${course.name}" (types: ${types.join(', ')})`)
      toDelete.push(course.id)
    } else {
      process.stdout.write('.')
    }

    await sleep(150)
  }

  console.log(`\n\nFound ${toDelete.length} non-golf-course entries to delete.\n`)

  if (toDelete.length === 0) { console.log('Nothing to delete.'); return }

  // Delete in batches
  const { error: deleteError } = await supabase
    .from('courses')
    .delete()
    .in('id', toDelete)

  if (deleteError) {
    console.error('Delete failed:', deleteError)
  } else {
    console.log(`Deleted ${toDelete.length} non-golf-course entries.`)
  }
}

main().catch(console.error)
