/**
 * One-time backfill: download each approved course's Google Place photos and
 * store them in the Supabase `course-photos` bucket, saving the public URLs to
 * `courses.photos`. After this runs (and the frontend prefers stored photos),
 * the site serves imagery from Supabase Storage for free instead of calling the
 * billable Google Places Details/Photo APIs on every page view.
 *
 * Safe to re-run — it only touches approved courses that have a google_place_id
 * and no photos yet.
 *
 * Run: npx ts-node --esm scripts/backfill-photos-to-storage.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function getPhotoRefs(placeId: string): Promise<string[]> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=photos&key=${API_KEY}`
  const res = await fetch(url)
  const data = (await res.json()) as {
    status: string
    result?: { photos?: { photo_reference: string }[] }
  }
  if (data.status !== 'OK') return []
  return (data.result?.photos ?? []).slice(0, 3).map((p) => p.photo_reference)
}

async function storePhotos(courseId: string, placeId: string): Promise<string[]> {
  const refs = await getPhotoRefs(placeId)
  const urls: string[] = []
  for (let i = 0; i < refs.length; i++) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo` +
        `?maxwidth=800&photo_reference=${refs[i]}&key=${API_KEY}`,
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
    if (error) {
      console.log(`  upload error (${path}): ${error.message}`)
      continue
    }
    urls.push(
      supabase.storage.from('course-photos').getPublicUrl(path).data.publicUrl,
    )
  }
  return urls
}

async function main() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, google_place_id, photos')
    .eq('approved', true)
    .not('google_place_id', 'is', null)
  if (error) throw error

  const todo = (courses ?? []).filter((c) => !c.photos || c.photos.length === 0)
  console.log(
    `Backfilling ${todo.length} courses (of ${courses?.length} approved with a place_id)…`,
  )

  let ok = 0
  let none = 0
  for (const c of todo) {
    await sleep(120)
    let urls: string[] = []
    try {
      urls = await storePhotos(c.id, c.google_place_id!)
    } catch (e) {
      console.log(`✗ ${c.name}: ${(e as Error).message}`)
      continue
    }
    if (urls.length === 0) {
      console.log(`- ${c.name}: no photos`)
      none++
      continue
    }
    const { error: upErr } = await supabase
      .from('courses')
      .update({ photos: urls })
      .eq('id', c.id)
    if (upErr) {
      console.log(`✗ ${c.name}: ${upErr.message}`)
      continue
    }
    console.log(`✓ ${c.name}: ${urls.length}`)
    ok++
  }
  console.log(`\nDone. Stored photos for ${ok} courses; ${none} had none on Google.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
