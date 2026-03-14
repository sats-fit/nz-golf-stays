/**
 * Imports NZ golf courses from Google Places API Text Search.
 * Searches across NZ regions to get comprehensive coverage.
 * Run with: npx ts-node --project tsconfig.json scripts/import/import-places.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

type PlaceResult = {
  place_id: string
  name: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
  types: string[]
}

type TextSearchResponse = {
  results: PlaceResult[]
  status: string
  next_page_token?: string
  error_message?: string
}

// NZ regions to search — spread across the country for full coverage
const SEARCH_QUERIES = [
  'golf club Northland New Zealand',
  'golf club Auckland New Zealand',
  'golf club Waikato New Zealand',
  'golf club Bay of Plenty New Zealand',
  'golf club Gisborne New Zealand',
  'golf club Hawke\'s Bay New Zealand',
  'golf club Taranaki New Zealand',
  'golf club Manawatu New Zealand',
  'golf club Whanganui New Zealand',
  'golf club Wellington New Zealand',
  'golf club Nelson New Zealand',
  'golf club Marlborough New Zealand',
  'golf club West Coast New Zealand',
  'golf club Canterbury New Zealand',
  'golf club Otago New Zealand',
  'golf club Southland New Zealand',
  'golf club Coromandel New Zealand',
  'golf club Wairarapa New Zealand',
]

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const results: PlaceResult[] = []
  let pageToken: string | undefined

  do {
    const url = pageToken
      ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${API_KEY}`
      : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`

    const res = await fetch(url)
    const data = await res.json() as TextSearchResponse

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`  API error for "${query}": ${data.status}${data.error_message ? ` — ${data.error_message}` : ''}`)
      break
    }

    results.push(...(data.results ?? []))
    pageToken = data.next_page_token

    if (pageToken) await sleep(2000) // Required delay before using next_page_token
  } while (pageToken)

  return results
}

async function getPlaceDetails(placeId: string): Promise<{ phone?: string; website?: string } | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=formatted_phone_number,website&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { formatted_phone_number?: string; website?: string }; status: string }
  if (data.status !== 'OK') return null
  return {
    phone: data.result?.formatted_phone_number,
    website: data.result?.website,
  }
}

function extractRegion(address: string): string {
  // Extract NZ region from formatted address
  const regionMap: Record<string, string> = {
    'Auckland': 'Auckland',
    'Northland': 'Northland',
    'Waikato': 'Waikato',
    'Bay of Plenty': 'Bay of Plenty',
    'Gisborne': 'Gisborne',
    "Hawke's Bay": "Hawke's Bay",
    'Taranaki': 'Taranaki',
    'Manawatu': 'Manawatu-Whanganui',
    'Whanganui': 'Manawatu-Whanganui',
    'Wellington': 'Wellington',
    'Nelson': 'Nelson',
    'Marlborough': 'Marlborough',
    'West Coast': 'West Coast',
    'Canterbury': 'Canterbury',
    'Otago': 'Otago',
    'Southland': 'Southland',
  }
  for (const [key, value] of Object.entries(regionMap)) {
    if (address.includes(key)) return value
  }
  return ''
}

async function main() {
  // Get existing place_ids to avoid duplicates
  const { data: existing } = await supabase
    .from('courses')
    .select('google_place_id, name')
  const existingPlaceIds = new Set((existing ?? []).map(c => c.google_place_id).filter(Boolean))
  const existingNames = new Set((existing ?? []).map(c => c.name.toLowerCase()))

  console.log(`Already have ${existingPlaceIds.size} courses in DB\n`)

  // Collect all unique places across all queries
  const seen = new Set<string>()
  const allPlaces: PlaceResult[] = []

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: ${query}`)
    const results = await searchPlaces(query)
    let newCount = 0
    for (const place of results) {
      if (!seen.has(place.place_id)) {
        seen.add(place.place_id)
        allPlaces.push(place)
        newCount++
      }
    }
    console.log(`  Found ${results.length} results, ${newCount} new (total unique: ${allPlaces.length})`)
    await sleep(500)
  }

  // Filter out already-imported places
  const toImport = allPlaces.filter(p => !existingPlaceIds.has(p.place_id))
  console.log(`\nTotal unique courses found: ${allPlaces.length}`)
  console.log(`New courses to import: ${toImport.length}\n`)

  let imported = 0
  let skipped = 0

  for (const place of toImport) {
    const name = place.name
    const nameLower = name.toLowerCase()

    // Skip if same name already exists
    if (existingNames.has(nameLower)) {
      console.log(`Skipping duplicate name: ${name}`)
      skipped++
      continue
    }

    // Fetch phone + website
    await sleep(200)
    const details = await getPlaceDetails(place.place_id)

    const course = {
      name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      region: extractRegion(place.formatted_address),
      phone: details?.phone ?? null,
      website: details?.website ?? null,
      google_place_id: place.place_id,
      overnight_stays: false,
      stay_n_play: 'no' as const,
      stay_no_play: false,
      dogs: 'unknown' as const,
      power: false,
      ask_first: false,
      approved: true,
    }

    const { error } = await supabase.from('courses').insert(course)
    if (error) {
      console.error(`  Failed to insert ${name}:`, error.message)
    } else {
      console.log(`  ✓ Imported: ${name} (${course.region || 'unknown region'})`)
      existingNames.add(nameLower)
      imported++
    }
  }

  console.log(`\nDone! Imported ${imported} new courses, skipped ${skipped} duplicates.`)
}

main().catch(console.error)
