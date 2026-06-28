/**
 * Persist a course's Google Place photos into Supabase Storage so we can serve
 * them for free instead of calling the billable Google Places Photo/Details
 * APIs on every page view.
 *
 * Used by the one-off backfill script and by the admin approval flow (so new
 * courses get stored photos at approval time). Best-effort throughout — any
 * failed Google/Storage call is skipped rather than thrown.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

const KEY = () => process.env.GOOGLE_MAPS_API_KEY

/** Up to 3 photo references for a place (one legacy Place Details call). */
async function getPhotoRefs(placeId: string): Promise<string[]> {
  const key = KEY()
  if (!key) return []
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}&fields=photos&key=${key}`
    const res = await fetch(url)
    const data = (await res.json()) as {
      status: string
      result?: { photos?: { photo_reference: string }[] }
    }
    if (data.status !== 'OK') return []
    return (data.result?.photos ?? []).slice(0, 3).map((p) => p.photo_reference)
  } catch {
    return []
  }
}

/**
 * Download a course's Google photos, upload them to the `course-photos` bucket,
 * and return the public URLs (suitable for storing in `courses.photos`).
 * Returns whatever uploaded successfully (possibly empty).
 */
export async function storeCoursePhotos(
  supabase: SupabaseClient,
  courseId: string,
  placeId: string,
): Promise<string[]> {
  const key = KEY()
  if (!key) return []

  const refs = await getPhotoRefs(placeId)
  const urls: string[] = []

  for (let i = 0; i < refs.length; i++) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/photo` +
          `?maxwidth=800&photo_reference=${refs[i]}&key=${key}`,
      )
      if (!res.ok) continue
      const bytes = new Uint8Array(await res.arrayBuffer())
      const path = `google/${courseId}-${i}.jpg`
      const { error } = await supabase.storage
        .from('course-photos')
        .upload(path, bytes, {
          contentType: res.headers.get('content-type') ?? 'image/jpeg',
          upsert: true,
        })
      if (error) continue
      urls.push(
        supabase.storage.from('course-photos').getPublicUrl(path).data.publicUrl,
      )
    } catch {
      // skip this photo
    }
  }

  return urls
}
