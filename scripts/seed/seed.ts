/**
 * Seeds NZ golf courses into Supabase
 *
 * Run with: npx tsx scripts/seed/seed.ts
 * Input: scripts/seed/courses-geocoded.json (or courses-raw.json if geocoding not done)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS
)

type SeedCourse = {
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  region: string | null
  phone: string | null
  website: string | null
  overnight_stays?: boolean
  stay_n_play?: 'yes' | 'no' | 'free_with_gf'
  stay_no_play?: boolean
  dogs?: 'yes' | 'no' | 'unknown'
  power?: boolean
  ask_first?: boolean
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function main() {
  // Try geocoded first, fall back to raw
  let inputPath = path.join(__dirname, 'courses-geocoded.json')
  if (!fs.existsSync(inputPath)) {
    inputPath = path.join(__dirname, 'courses-raw.json')
    console.log('Geocoded file not found, using courses-raw.json')
  }

  if (!fs.existsSync(inputPath)) {
    console.error('No seed data found. Run scraper first: npx tsx scripts/scrape/scrape-nzgolf.ts')
    process.exit(1)
  }

  const courses: SeedCourse[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`Seeding ${courses.length} courses...`)

  const batches = chunk(courses, 50)
  let total = 0

  for (const batch of batches) {
    const { error } = await supabase.from('courses').insert(
      batch.map(c => ({
        name: c.name,
        address: c.address,
        lat: c.lat ?? null,
        lng: c.lng ?? null,
        region: c.region,
        phone: c.phone,
        website: c.website,
        overnight_stays: c.overnight_stays ?? false,
        stay_n_play: c.stay_n_play ?? 'no',
        stay_no_play: c.stay_no_play ?? false,
        dogs: c.dogs ?? 'unknown',
        power: c.power ?? false,
        ask_first: c.ask_first ?? false,
        photos: [],
        approved: true, // scraped/curated data is auto-approved
      }))
    )

    if (error) {
      console.error('Batch insert error:', error)
    } else {
      total += batch.length
      console.log(`Inserted batch of ${batch.length} (total: ${total})`)
    }
  }

  console.log(`Done! Seeded ${total}/${courses.length} courses.`)
}

main().catch(console.error)
