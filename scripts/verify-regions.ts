/**
 * Reverse-geocodes every course's lat/lng and checks whether the stored region
 * matches the actual NZ region returned by Google.
 *
 * Run (dry run — print mismatches only):
 *   npx ts-node --project tsconfig.json scripts/verify-regions.ts
 *
 * Run (apply fixes):
 *   npx ts-node --project tsconfig.json scripts/verify-regions.ts --fix
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY

// Map Google's administrative_area_level_1 values to our canonical region names.
// Google sometimes uses different spelling/hyphenation for NZ regions.
const REGION_ALIASES: Record<string, string> = {
  'auckland':                   'Auckland',
  'bay of plenty':               'Bay of Plenty',
  'canterbury':                  'Canterbury',
  'gisborne':                    'Gisborne',
  "hawke's bay":                 "Hawke's Bay",
  "hawkes bay":                  "Hawke's Bay",
  'manawatu-wanganui':           'Manawatu-Whanganui',
  'manawatu-whanganui':          'Manawatu-Whanganui',
  'manawatū-whanganui':          'Manawatu-Whanganui',
  'marlborough':                 'Marlborough',
  'nelson':                      'Nelson',
  'northland':                   'Northland',
  'otago':                       'Otago',
  'southland':                   'Southland',
  'taranaki':                    'Taranaki',
  'tasman':                      'Tasman',
  'waikato':                     'Waikato',
  'wellington':                  'Wellington',
  'west coast':                  'West Coast',
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const params = new URLSearchParams({ latlng: `${lat},${lng}`, key: API_KEY!, result_type: 'administrative_area_level_1' })
  const res = await fetch(`${GEOCODE_URL}?${params}`)
  const data = await res.json() as {
    status: string
    results: Array<{ address_components: Array<{ long_name: string; types: string[] }> }>
  }
  if (data.status !== 'OK' || !data.results[0]) return null
  for (const component of data.results[0].address_components) {
    if (component.types.includes('administrative_area_level_1')) {
      // Google often returns "Wellington Region", "Canterbury Region" etc — strip suffix
      const stripped = component.long_name.replace(/ Region$/i, '').trim()
      return REGION_ALIASES[stripped.toLowerCase()]
        ?? REGION_ALIASES[component.long_name.toLowerCase()]
        ?? stripped
    }
  }
  return null
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  if (!API_KEY) { console.error('GOOGLE_MAPS_API_KEY not set'); process.exit(1) }

  const fix = process.argv.includes('--fix')
  const sample = process.argv.includes('--sample')  // show first 20 mismatches then stop
  console.log(fix ? 'Mode: FIX (will update mismatches in Supabase)' : sample ? 'Mode: SAMPLE (first 20 mismatches)' : 'Mode: DRY RUN (--fix to apply changes)\n')

  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, region, lat, lng')
    .eq('approved', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('name')

  if (error) { console.error(error); process.exit(1) }
  console.log(`Checking ${courses!.length} courses...\n`)

  let mismatches = 0
  let fixed = 0
  let failed = 0

  for (const course of courses!) {
    const actual = await reverseGeocode(course.lat!, course.lng!)
    if (!actual) { failed++; continue }

    if (actual !== course.region) {
      mismatches++
      console.log(`MISMATCH: ${course.name}`)
      console.log(`  stored: ${course.region ?? '(none)'}`)
      console.log(`  actual: ${actual}`)
      if (sample && mismatches >= 20) { console.log('\n[Sample limit reached]'); break }
      if (fix) {
        const { error: updateError } = await supabase
          .from('courses')
          .update({ region: actual })
          .eq('id', course.id)
        if (updateError) {
          console.log(`  ✗ update failed: ${updateError.message}`)
        } else {
          console.log(`  ✓ updated`)
          fixed++
        }
      }
    }

    await sleep(100)
  }

  console.log(`\n--- Summary ---`)
  console.log(`Checked: ${courses!.length}`)
  console.log(`Mismatches: ${mismatches}`)
  if (fix) console.log(`Fixed: ${fixed}`)
  if (failed > 0) console.log(`Failed to geocode: ${failed}`)
  if (!fix && mismatches > 0) console.log(`\nRun with --fix to apply corrections.`)
}

main().catch(console.error)
