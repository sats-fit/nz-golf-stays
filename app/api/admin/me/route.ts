import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ isAdmin: false })
  }

  const admin = createSupabaseAdminClient()
  const { data } = await admin.from('admins').select('user_id').eq('user_id', user.id).single()

  return NextResponse.json({ isAdmin: !!data })
}
