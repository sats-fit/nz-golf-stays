import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

// In-memory cache of photo references per place_id (TTL 24h) so we don't call the
// Place Details API on every request for the same course.
const refCache = new Map<string, { refs: string[]; ts: number }>()
const CACHE_TTL = 86_400_000

async function getPhotoRefsFromGoogle(placeId: string): Promise<string[]> {
  const cached = refCache.get(placeId)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.refs

  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=photos&key=${API_KEY}`
  let refs: string[] = []
  try {
    const res = await fetch(url)
    const data = await res.json() as { result?: { photos?: { photo_reference: string }[] } }
    refs = (data.result?.photos ?? []).slice(0, 3).map((p) => p.photo_reference)
  } catch {
    refs = []
  }
  refCache.set(placeId, { refs, ts: Date.now() })
  return refs
}

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')
  const index = parseInt(request.nextUrl.searchParams.get('index') ?? '0', 10)

  if (!placeId) return new NextResponse('Missing place_id', { status: 400 })

  // Security gate: only fetch from Google for place_ids that belong to an approved
  // course in our DB. This prevents the endpoint being abused as an open, billable
  // proxy for arbitrary attacker-supplied place_ids, while still serving real photos.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('google_place_id', placeId)
    .eq('approved', true)
    .maybeSingle()

  if (!course) return new NextResponse('Unknown place', { status: 404 })

  const refs = await getPhotoRefsFromGoogle(placeId)
  const photoRef = refs[Math.min(index, refs.length - 1)] ?? null
  if (!photoRef) {
    // CDN-cache the "no photo" result so a course Google has no imagery for
    // doesn't re-trigger a billable Place Details call on every page view.
    return new NextResponse('No photo found', {
      status: 404,
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    })
  }

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`

  let photoRes: Response
  try {
    photoRes = await fetch(photoUrl)
  } catch {
    return new NextResponse('Photo fetch failed', { status: 502 })
  }
  if (!photoRes.ok) return new NextResponse('Photo fetch failed', { status: 502 })

  const buffer = await photoRes.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': photoRes.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 7 days CDN + browser cache
    },
  })
}
