/**
 * Server-side Google Maps helpers (Geocoding + legacy Places API).
 *
 * Used to "find a course on Google Maps" when an admin approves a brand-new
 * submission: resolve its coordinates, Google Place, rating and photos so the
 * listing gets a map pin and imagery without any manual data entry.
 *
 * Everything here is best-effort — a failed/blocked API call returns null/{}
 * rather than throwing, so callers never block on Google being reachable.
 *
 * Uses the same legacy Places endpoints as scripts/import/* to stay consistent
 * with the existing (legacy-Places) key restrictions.
 */

const KEY = () => process.env.GOOGLE_MAPS_API_KEY

/** Geocode a free-text NZ address to coordinates. */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = KEY()
  if (!key || !address.trim()) return null
  try {
    const query = address.toLowerCase().includes('new zealand') ? address : `${address}, New Zealand`
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`
    const res = await fetch(url)
    const json = await res.json()
    if (json.status === 'OK' && json.results?.[0]) {
      const { lat, lng } = json.results[0].geometry.location
      return { lat, lng }
    }
  } catch {}
  return null
}

type FoundPlace = {
  place_id: string
  lat: number | null
  lng: number | null
  rating: number | null
  ratingCount: number | null
}

/** Find a single Google Place from a free-text query (e.g. course name + address). */
export async function findPlaceFromText(query: string): Promise<FoundPlace | null> {
  const key = KEY()
  if (!key || !query.trim()) return null
  try {
    const fields = 'place_id,geometry,rating,user_ratings_total'
    const url =
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
      `?input=${encodeURIComponent(query)}&inputtype=textquery&fields=${fields}&key=${key}`
    const res = await fetch(url)
    const json = await res.json() as {
      status: string
      candidates?: {
        place_id: string
        geometry?: { location?: { lat: number; lng: number } }
        rating?: number
        user_ratings_total?: number
      }[]
    }
    const c = json.status === 'OK' ? json.candidates?.[0] : undefined
    if (!c) return null
    return {
      place_id: c.place_id,
      lat: c.geometry?.location?.lat ?? null,
      lng: c.geometry?.location?.lng ?? null,
      rating: c.rating ?? null,
      ratingCount: c.user_ratings_total ?? null,
    }
  } catch {}
  return null
}

type PlaceDetails = { phone: string | null; website: string | null; photoRefs: string[] }

/** Fetch phone, website and up to 3 photo references for a known place id. */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const key = KEY()
  if (!key || !placeId) return null
  try {
    const fields = 'formatted_phone_number,website,photos'
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}&fields=${fields}&key=${key}`
    const res = await fetch(url)
    const json = await res.json() as {
      status: string
      result?: {
        formatted_phone_number?: string
        website?: string
        photos?: { photo_reference: string }[]
      }
    }
    if (json.status !== 'OK' || !json.result) return null
    return {
      phone: json.result.formatted_phone_number ?? null,
      website: json.result.website ?? null,
      photoRefs: (json.result.photos ?? []).slice(0, 3).map(p => p.photo_reference),
    }
  } catch {}
  return null
}

/** The subset of a course row this helper reads and may fill in. */
export type EnrichableCourse = {
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  website: string | null
  google_place_id: string | null
  google_rating: number | null
  google_rating_count: number | null
  photo_references: string[] | null
}

/**
 * Resolve a course on Google Maps and return ONLY the fields worth filling in
 * (missing coords, place id, rating, photos, phone, website). Never overwrites
 * values an admin has already set. Returns {} if nothing could be resolved.
 */
export async function enrichCourseFromGoogle(course: EnrichableCourse): Promise<Record<string, unknown>> {
  const updates: Record<string, unknown> = {}
  let placeId = course.google_place_id
  let lat = course.lat
  let lng = course.lng

  // 1. Find the Google Place (gives place id, coords, rating) if we don't have one.
  if (!placeId) {
    const queryParts = [course.name, course.address].filter(Boolean) as string[]
    const found = await findPlaceFromText(`${queryParts.join(', ')}, New Zealand`)
    if (found) {
      placeId = found.place_id
      updates.google_place_id = found.place_id
      if (lat == null && found.lat != null) { updates.lat = found.lat; lat = found.lat }
      if (lng == null && found.lng != null) { updates.lng = found.lng; lng = found.lng }
      if (course.google_rating == null && found.rating != null) updates.google_rating = found.rating
      if (course.google_rating_count == null && found.ratingCount != null) updates.google_rating_count = found.ratingCount
    }
  }

  // 2. Fall back to plain geocoding if we still have no coordinates.
  if ((lat == null || lng == null) && course.address) {
    const coords = await geocodeAddress(course.address)
    if (coords) { updates.lat = coords.lat; updates.lng = coords.lng }
  }

  // 3. Pull photos (and backfill phone/website) from the place details.
  const needsDetails = !!placeId && (course.photo_references == null || !course.phone || !course.website)
  if (needsDetails && placeId) {
    const details = await getPlaceDetails(placeId)
    if (details) {
      if (course.photo_references == null && details.photoRefs.length > 0) updates.photo_references = details.photoRefs
      if (!course.phone && details.phone) updates.phone = details.phone
      if (!course.website && details.website) updates.website = details.website
    }
  }

  return updates
}
