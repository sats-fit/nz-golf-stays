import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

// In-memory fallback cache for courses not yet in DB (TTL 24h)
const fallbackCache = new Map<string, { refs: string[]; ts: number }>()
const CACHE_TTL = 86_400_000

async function getPhotoRefFromGoogle(placeId: string): Promise<string[]> {
  const cached = fallbackCache.get(placeId)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.refs

  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=photos&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { result?: { photos?: { photo_reference: string }[] } }
  const refs = (data.result?.photos ?? []).slice(0, 3).map((p: { photo_reference: string }) => p.photo_reference)

  fallbackCache.set(placeId, { refs, ts: Date.now() })
  return refs
}

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')
  const index = parseInt(request.nextUrl.searchParams.get('index') ?? '0', 10)

  if (!placeId) return new NextResponse('Missing place_id', { status: 400 })

  // Try DB first — avoids a place/details API call
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('courses')
    .select('photo_references')
    .eq('google_place_id', placeId)
    .single()

  let photoRef: string | null = null

  if (data?.photo_references?.length) {
    photoRef = data.photo_references[Math.min(index, data.photo_references.length - 1)] ?? null
  } else {
    // Fallback: fetch from Google (and cache in memory)
    const refs = await getPhotoRefFromGoogle(placeId)
    photoRef = refs[Math.min(index, refs.length - 1)] ?? null
  }

  if (!photoRef) return new NextResponse('No photo found', { status: 404 })

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`

  const photoRes = await fetch(photoUrl)
  if (!photoRes.ok) return new NextResponse('Photo fetch failed', { status: 502 })

  const buffer = await photoRes.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': photoRes.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400', // 7 days
    },
  })
}
