/**
 * Compares CSV of official NZ golf clubs against DB, imports missing ones via Google Places.
 * Run with: npx ts-node --project tsconfig.json scripts/import/import-from-csv.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

const DISTRICT_TO_REGION: Record<string, string> = {
  'AORANGI': 'Canterbury',
  'AUCKLAND': 'Auckland',
  'BAY OF PLENTY': 'Bay of Plenty',
  'CANTERBURY': 'Canterbury',
  'HAWKES BAY': "Hawke's Bay",
  'MANAWATU/WANGANUI': 'Manawatu-Whanganui',
  'NORTH HARBOUR': 'Auckland',
  'NORTHLAND': 'Northland',
  'OTAGO': 'Otago',
  'POVERTY BAY/EAST COAST': 'Gisborne',
  'SOUTHLAND': 'Southland',
  'TARANAKI': 'Taranaki',
  'TASMAN': 'Nelson',
  'WAIKATO': 'Waikato',
  'WELLINGTON': 'Wellington',
}

type PlaceResult = {
  place_id: string
  name: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function findPlace(name: string, region: string): Promise<PlaceResult | null> {
  const query = encodeURIComponent(`${name} New Zealand`)
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${query}&inputtype=textquery` +
    `&fields=place_id,name,formatted_address,geometry` +
    `&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as {
    candidates?: PlaceResult[]
    status: string
    error_message?: string
  }
  if (data.status !== 'OK') return null
  return data.candidates?.[0] ?? null
}

async function getDetails(placeId: string): Promise<{ phone?: string; website?: string }> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=formatted_phone_number,website&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { formatted_phone_number?: string; website?: string } }
  return { phone: data.result?.formatted_phone_number, website: data.result?.website }
}

// Normalise name for fuzzy matching (lowercase, remove punctuation, common suffixes)
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(golf club|golf course|golf resort|golf links|inc|ltd|incorporated)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  // Load CSV
  const csvPath = path.join(process.cwd(), 'scripts/import/nz-golf-clubs.csv')
  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n').slice(1) // skip header
  const csvClubs = lines
    .map(line => {
      const [name, district] = line.split(',')
      return { name: name?.trim(), district: district?.trim() }
    })
    .filter(c => c.name && c.district)

  console.log(`CSV has ${csvClubs.length} clubs\n`)

  // Load existing DB courses
  const { data: existing } = await supabase.from('courses').select('name, google_place_id')
  const existingNormed = new Set((existing ?? []).map(c => normalise(c.name)))
  const existingPlaceIds = new Set((existing ?? []).map(c => c.google_place_id).filter(Boolean))

  console.log(`DB has ${existing?.length ?? 0} courses\n`)

  // Find missing
  const missing = csvClubs.filter(c => !existingNormed.has(normalise(c.name)))
  console.log(`Missing from DB: ${missing.length} clubs\n`)
  missing.forEach(c => console.log(`  - ${c.name} (${c.district})`))
  console.log()

  let imported = 0
  let notFound = 0

  for (const club of missing) {
    const region = DISTRICT_TO_REGION[club.district] ?? ''
    console.log(`Searching: ${club.name}`)
    await sleep(250)

    const place = await findPlace(club.name, region)
    if (!place) {
      console.log(`  ✗ Not found on Google Places\n`)
      notFound++
      continue
    }

    if (existingPlaceIds.has(place.place_id)) {
      console.log(`  ↩ Already in DB by place_id (name mismatch): ${place.name}\n`)
      // Update name to canonical CSV name
      await supabase.from('courses').update({ name: club.name, region }).eq('google_place_id', place.place_id)
      continue
    }

    await sleep(150)
    const details = await getDetails(place.place_id)

    const { error } = await supabase.from('courses').insert({
      name: club.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      region,
      phone: details.phone ?? null,
      website: details.website ?? null,
      google_place_id: place.place_id,
      overnight_stays: false,
      stay_n_play: 'no',
      stay_no_play: false,
      dogs: 'unknown',
      power: false,
      ask_first: false,
      approved: true,
    })

    if (error) {
      console.log(`  ✗ Insert failed: ${error.message}\n`)
    } else {
      console.log(`  ✓ Imported: ${club.name} → ${place.formatted_address}\n`)
      existingPlaceIds.add(place.place_id)
      existingNormed.add(normalise(club.name))
      imported++
    }
  }

  console.log(`\nDone! Imported ${imported} new clubs. ${notFound} not found on Google Places.`)
}

main().catch(console.error)
