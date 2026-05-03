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

  const { id, notes } = await req.json() as { id: string; notes: string | null }

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('courses')
    .update({ notes: notes?.trim() || null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
