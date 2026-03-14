import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

// Cache place details for 24h to avoid redundant API calls
const detailsCache = new Map<string, { photos: { photo_reference: string }[]; ts: number }>()
const CACHE_TTL = 86_400_000

async function getPhotoReference(placeId: string, index: number): Promise<string | null> {
  const cached = detailsCache.get(placeId)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.photos[Math.min(index, cached.photos.length - 1)]?.photo_reference ?? null
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=photos&key=${API_KEY}`

  const res = await fetch(url)
  const data = await res.json() as { result?: { photos?: { photo_reference: string }[] } }
  const photos = data.result?.photos ?? []

  detailsCache.set(placeId, { photos, ts: Date.now() })
  return photos[Math.min(index, photos.length - 1)]?.photo_reference ?? null
}

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')
  const index = parseInt(request.nextUrl.searchParams.get('index') ?? '0', 10)

  if (!placeId) return new NextResponse('Missing place_id', { status: 400 })

  const photoRef = await getPhotoReference(placeId, index)
  if (!photoRef) return new NextResponse('No photo found', { status: 404 })

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`

  const photoRes = await fetch(photoUrl)
  if (!photoRes.ok) return new NextResponse('Photo fetch failed', { status: 502 })

  const buffer = await photoRes.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': photoRes.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
