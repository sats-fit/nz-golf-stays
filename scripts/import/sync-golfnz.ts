/**
 * Syncs golf.co.nz scraped clubs against our DB:
 *  - Updates existing courses missing phone / email / website
 *  - Inserts new courses (via Google Places for address, lat/lng, website)
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/import/sync-golfnz.ts
 *
 * Flags:
 *   --dry-run   Print changes without writing to DB
 *   --updates-only  Only patch existing records, skip new inserts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')
const UPDATES_ONLY = process.argv.includes('--updates-only')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

const REGION_MAP: Record<string, string> = {
  'Aorangi':             'Canterbury',
  'Auckland':            'Auckland',
  'Bay of Plenty':       'Bay of Plenty',
  'Canterbury':          'Canterbury',
  'Hawkes Bay':          "Hawke's Bay",
  'Manawatu/Wanganui':   'Manawatu-Whanganui',
  'North Harbour':       'Auckland',
  'Northland':           'Northland',
  'Otago':               'Otago',
  'Southland':           'Southland',
  'Tairawhiti':          'Gisborne',
  'Taranaki':            'Taranaki',
  'Tasman':              'Nelson',
  'Waikato':             'Waikato',
  'Wellington':          'Wellington',
}

type ScrapedClub = {
  region: string
  clubId: number
  name: string
  address1: string
  address2: string
  address3: string
  email: string | null
  phone: string | null
  website: string | null
  lat: number
  lng: number
  holes: number
  hasTeeBooking: boolean
  url: string
}

type PlaceResult = {
  place_id: string
  name: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(golf club|golf course|golf resort|golf links|golf & country club|country club|inc|ltd|incorporated)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function findPlace(name: string): Promise<PlaceResult | null> {
  const query = encodeURIComponent(`${name} New Zealand`)
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${query}&inputtype=textquery` +
    `&fields=place_id,name,formatted_address,geometry` +
    `&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { candidates?: PlaceResult[]; status: string }
  if (data.status !== 'OK') return null
  return data.candidates?.[0] ?? null
}

async function getPlaceDetails(placeId: string): Promise<{ phone?: string; website?: string }> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=formatted_phone_number,website&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { formatted_phone_number?: string; website?: string } }
  return { phone: data.result?.formatted_phone_number, website: data.result?.website }
}

async function main() {
  const clubsPath = path.join(process.cwd(), 'scripts/golfnz-clubs.json')
  const scraped: ScrapedClub[] = JSON.parse(fs.readFileSync(clubsPath, 'utf-8'))
  console.log(`Scraped clubs: ${scraped.length}`)

  const { data: existing, error } = await supabase.from('courses').select('id, name, phone, email, website, google_place_id')
  if (error) throw error
  console.log(`DB courses: ${existing!.length}\n`)

  const dbByNorm = new Map(existing!.map(c => [normalise(c.name), c]))
  const dbByPlaceId = new Map(existing!.filter(c => c.google_place_id).map(c => [c.google_place_id!, c]))

  let updated = 0, inserted = 0, skipped = 0

  for (const club of scraped) {
    const norm = normalise(club.name)
    const dbCourse = dbByNorm.get(norm)

    if (dbCourse) {
      // --- UPDATE existing: fill in missing phone / email ---
      // Sanitise phone: reject placeholder values, take first number if multiple listed
      const cleanPhone = club.phone
        ?.split(/[\/,]/)[0].trim()
        .replace(/^none$/i, '') || null

      const patch: Record<string, string> = {}
      if (!dbCourse.phone && cleanPhone) patch.phone = cleanPhone
      if (!dbCourse.email && club.email) patch.email = club.email

      if (Object.keys(patch).length === 0) {
        skipped++
        continue
      }

      console.log(`UPDATE  ${club.name}`)
      Object.entries(patch).forEach(([k, v]) => console.log(`        ${k}: ${v}`))

      if (!DRY_RUN) {
        const { error } = await supabase.from('courses').update(patch).eq('id', dbCourse.id)
        if (error) console.log(`        ✗ ${error.message}`)
        else { console.log('        ✓'); updated++ }
      } else {
        updated++
      }
      continue
    }

    if (UPDATES_ONLY) { skipped++; continue }

    // --- INSERT new club ---
    console.log(`INSERT  ${club.name} (${club.region})`)
    await sleep(250)

    const place = await findPlace(club.name)
    if (!place) {
      console.log(`        ✗ Not found on Google Places\n`)
      skipped++
      continue
    }

    // Check if place_id already in DB (name mismatch)
    if (dbByPlaceId.has(place.place_id)) {
      console.log(`        ↩ Already in DB by place_id (${place.name}) — skipping\n`)
      skipped++
      continue
    }

    await sleep(150)
    const details = await getPlaceDetails(place.place_id)

    const region = REGION_MAP[club.region] ?? club.region
    const row = {
      name: club.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      region,
      phone: details.phone ?? club.phone ?? null,
      email: club.email ?? null,
      website: details.website ?? null,
      google_place_id: place.place_id,
      overnight_stays: false,
      dogs: 'unknown',
      power: false,
      booking: 'unknown',
      pricing_type: 'unknown',
      approved: true,
    }

    if (!DRY_RUN) {
      const { error } = await supabase.from('courses').insert(row)
      if (error) {
        console.log(`        ✗ ${error.message}\n`)
        skipped++
      } else {
        console.log(`        ✓ ${place.formatted_address}\n`)
        dbByPlaceId.set(place.place_id, { id: '', name: club.name, phone: row.phone, email: row.email, website: row.website, google_place_id: place.place_id })
        dbByNorm.set(norm, { id: '', name: club.name, phone: row.phone, email: row.email, website: row.website, google_place_id: place.place_id })
        inserted++
      }
    } else {
      console.log(`        → ${place.formatted_address} (place_id: ${place.place_id})\n`)
      inserted++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Updated:  ${updated}`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Skipped:  ${skipped}`)
  if (DRY_RUN) console.log('\n(dry run — no changes written)')
}

main().catch(console.error)
