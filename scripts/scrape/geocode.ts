/**
 * Geocodes addresses using Google Maps Geocoding API
 *
 * Run with: npx tsx scripts/scrape/geocode.ts
 * Input:  scripts/seed/courses-raw.json
 * Output: scripts/seed/courses-geocoded.json
 */

import * as fs from 'fs'
import * as path from 'path'

type RawCourse = {
  name: string
  address: string | null
  region: string | null
  phone: string | null
  website: string | null
}

type GeocodedCourse = RawCourse & {
  lat: number | null
  lng: number | null
}

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const API_KEY = process.env.GOOGLE_MAPS_API_KEY

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!API_KEY) throw new Error('GOOGLE_MAPS_API_KEY env var is not set')

  const params = new URLSearchParams({
    address: `${address}, New Zealand`,
    key: API_KEY,
    region: 'nz',
  })

  const res = await fetch(`${GEOCODE_URL}?${params}`)
  const data = await res.json() as { status: string; results: Array<{ geometry: { location: { lat: number; lng: number } } }> }

  if (data.status === 'OK' && data.results[0]) {
    return data.results[0].geometry.location
  }

  console.warn(`Geocode failed for "${address}": ${data.status}`)
  return null
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const rawPath = path.join(__dirname, '../seed/courses-raw.json')
  const courses: RawCourse[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))

  console.log(`Geocoding ${courses.length} courses...`)

  const geocoded: GeocodedCourse[] = []

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    const address = [course.name, course.address, course.region]
      .filter(Boolean)
      .join(', ')

    process.stdout.write(`[${i + 1}/${courses.length}] ${course.name}...`)

    const location = await geocodeAddress(address)
    geocoded.push({
      ...course,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
    })

    console.log(location ? ` ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ' FAILED')

    // Rate limit: ~100ms between requests
    await sleep(120)
  }

  const outPath = path.join(__dirname, '../seed/courses-geocoded.json')
  fs.writeFileSync(outPath, JSON.stringify(geocoded, null, 2))
  console.log(`\nDone! Written to ${outPath}`)
  console.log(`Geocoded: ${geocoded.filter(c => c.lat !== null).length}/${geocoded.length}`)
}

main().catch(console.error)
