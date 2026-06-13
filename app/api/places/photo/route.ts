import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY!

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')
  const index = parseInt(request.nextUrl.searchParams.get('index') ?? '0', 10)

  if (!placeId) return new NextResponse('Missing place_id', { status: 400 })

  // Only serve photos for place_ids that already exist in our DB. This prevents
  // the endpoint being abused as an open, billable proxy: an attacker cannot make
  // us call the (paid) Google Places API for arbitrary place_ids they supply.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('courses')
    .select('photo_references')
    .eq('google_place_id', placeId)
    .maybeSingle()

  const refs = data?.photo_references
  if (!refs?.length) return new NextResponse('No photo found', { status: 404 })

  const photoRef = refs[Math.min(index, refs.length - 1)] ?? null
  if (!photoRef) return new NextResponse('No photo found', { status: 404 })

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
