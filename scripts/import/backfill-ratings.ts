/**
 * Fetches Google Places ratings and saves them to the courses table.
 * Run with: npx ts-node --project tsconfig.json scripts/import/backfill-ratings.ts
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

async function getRating(placeId: string): Promise<{ rating?: number; user_ratings_total?: number }> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=rating,user_ratings_total&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { rating?: number; user_ratings_total?: number }; status: string }
  if (data.status !== 'OK') return {}
  return {
    rating: data.result?.rating,
    user_ratings_total: data.result?.user_ratings_total,
  }
}

async function main() {
  const refreshAll = process.argv.includes('--all')
  let query = supabase.from('courses').select('id, name, google_place_id').not('google_place_id', 'is', null)
  if (!refreshAll) query = query.is('google_rating', null)  // only missing ones unless --all passed

  const { data: courses, error } = await query

  if (error) { console.error(error); process.exit(1) }
  if (!courses?.length) { console.log('All ratings already filled.'); return }

  console.log(`Fetching ratings for ${courses.length} courses...\n`)

  let updated = 0
  for (const course of courses) {
    const { rating, user_ratings_total } = await getRating(course.google_place_id)
    if (rating != null) {
      await supabase.from('courses').update({
        google_rating: rating,
        google_rating_count: user_ratings_total ?? null,
      }).eq('id', course.id)
      process.stdout.write(`✓ ${course.name}: ${rating} (${user_ratings_total})\n`)
      updated++
    } else {
      process.stdout.write(`- ${course.name}: no rating\n`)
    }
    await sleep(100)
  }

  console.log(`\nDone! Updated ${updated} courses.`)
}

main().catch(console.error)
