import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { geocodeAddress } from '@/lib/google/places'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const admin = createSupabaseAdminClient()
  const { data } = await admin.from('admins').select('user_id').eq('user_id', session.user.id).single()
  return data ? session : null
}

const ALLOWED_FIELDS = [
  'name', 'address', 'region', 'phone', 'website', 'email', 'notes',
  'overnight_stays',
  'free_with_green_fees',
  'stay_no_play_allowed', 'stay_no_play_price', 'stay_no_play_unit',
  'stay_with_play_allowed', 'stay_with_play_price', 'stay_with_play_unit',
  'donation_accepted',
  'power', 'power_additional_cost', 'power_unit',
  'dogs', 'booking',
]

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const fields: Record<string, unknown> = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k))
  )

  if (!fields.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  if (fields.address && typeof fields.address === 'string') {
    const coords = await geocodeAddress(fields.address)
    if (coords) { fields.lat = coords.lat; fields.lng = coords.lng }
  }

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('courses')
    .insert({ ...fields, approved: true, photos: [] })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...rest } = body

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const fields: Record<string, unknown> = Object.fromEntries(
    Object.entries(rest).filter(([k]) => ALLOWED_FIELDS.includes(k))
  )

  // Re-geocode if address was updated
  if (fields.address && typeof fields.address === 'string') {
    const coords = await geocodeAddress(fields.address)
    if (coords) { fields.lat = coords.lat; fields.lng = coords.lng }
  }

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('courses')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
