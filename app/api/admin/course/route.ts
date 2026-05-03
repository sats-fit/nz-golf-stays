import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

async function checkAdmin(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient()
  const { data } = await admin.from('admins').select('user_id').eq('user_id', userId).single()
  return !!data
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !(await checkAdmin(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...fields } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const ALLOWED = [
    'name', 'address', 'region', 'phone', 'website', 'email', 'notes',
    'overnight_stays',
    'free_with_green_fees',
    'stay_no_play_allowed', 'stay_no_play_price', 'stay_no_play_unit',
    'stay_with_play_allowed', 'stay_with_play_price', 'stay_with_play_unit',
    'donation_accepted',
    'power', 'power_additional_cost', 'power_unit',
    'dogs', 'booking',
  ]

  const update = Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED.includes(k))
  )

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('courses')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
