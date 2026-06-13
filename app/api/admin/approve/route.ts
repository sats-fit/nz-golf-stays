import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { enrichCourseFromGoogle } from '@/lib/google/places'

async function checkAdmin(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient()
  const { data } = await admin.from('admins').select('user_id').eq('user_id', userId).single()
  return !!data
}

const SUGGESTION_MERGE_FIELDS = [
  'name', 'address', 'region', 'phone', 'email', 'website',
  'overnight_stays', 'free_with_green_fees',
  'stay_no_play_allowed', 'stay_no_play_price', 'stay_no_play_unit',
  'stay_with_play_allowed', 'stay_with_play_price', 'stay_with_play_unit',
  'donation_accepted', 'dogs', 'power', 'power_additional_cost', 'power_unit', 'booking',
] as const

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !(await checkAdmin(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, action } = await req.json() as { id: string; action: 'approve' | 'reject' }

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  if (action === 'reject') {
    const { error } = await admin.from('courses').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  }

  // Fetch the pending record to check if it's a suggestion
  const { data: pending, error: fetchError } = await admin
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !pending) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  if (pending.suggestion_for_course_id) {
    // Merge suggestion fields into the original course, then delete the suggestion
    const mergeData = Object.fromEntries(
      SUGGESTION_MERGE_FIELDS.map(f => [f, pending[f]])
    )

    const { error: updateError } = await admin
      .from('courses')
      .update(mergeData)
      .eq('id', pending.suggestion_for_course_id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    const { error: deleteError } = await admin.from('courses').delete().eq('id', id)
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    return NextResponse.json({ merged: true })
  }

  // Regular new course submission — find it on Google Maps (coords, place,
  // rating, photos) before publishing, so it gets a map pin and imagery.
  // Best-effort: never let a Google hiccup block the approval.
  let enrichment: Record<string, unknown> = {}
  try {
    enrichment = await enrichCourseFromGoogle(pending)
  } catch {}

  const { error } = await admin
    .from('courses')
    .update({ ...enrichment, approved: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ approved: true, enriched: Object.keys(enrichment) })
}
