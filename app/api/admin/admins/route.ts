import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { ok: false as const, status: 401 }

  const admin = createSupabaseAdminClient()
  const { data } = await admin.from('admins').select('user_id').eq('user_id', session.user.id).single()
  if (!data) return { ok: false as const, status: 403 }
  return { ok: true as const, userId: session.user.id }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const admin = createSupabaseAdminClient()
  const { data: rows, error } = await admin.from('admins').select('user_id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Look up emails via auth.admin.listUsers (paginated; this app has a tiny admin list)
  const { data: users, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 })

  const emailById = new Map(users.users.map(u => [u.id, u.email ?? '']))
  const admins = (rows ?? []).map(r => ({
    user_id: r.user_id,
    email: emailById.get(r.user_id) ?? '(unknown)',
    isSelf: r.user_id === auth.userId,
  }))
  admins.sort((a, b) => a.email.localeCompare(b.email))
  return NextResponse.json({ admins })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const { email } = await req.json() as { email?: string }
  const cleaned = email?.trim().toLowerCase()
  if (!cleaned) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: users, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 })

  const target = users.users.find(u => u.email?.toLowerCase() === cleaned)
  if (!target) {
    return NextResponse.json(
      { error: 'No user with that email. They need to sign in once before being made an admin.' },
      { status: 404 }
    )
  }

  const { error } = await admin.from('admins').upsert({ user_id: target.id }, { onConflict: 'user_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, user_id: target.id, email: target.email })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })

  const userId = new URL(req.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (userId === auth.userId) {
    return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from('admins').delete().eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
