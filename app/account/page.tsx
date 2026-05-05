import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { AccountPageClient, type AdminEntry } from '@/components/account/AccountPageClient'

export const metadata = {
  title: 'Account — NZ Golf Stays',
}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/')

  const admin = createSupabaseAdminClient()
  const { data: adminRow } = await admin
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single()
  const isAdmin = !!adminRow

  let admins: AdminEntry[] = []
  if (isAdmin) {
    const [{ data: rows }, { data: users }] = await Promise.all([
      admin.from('admins').select('user_id'),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ])
    const emailById = new Map(users.users.map(u => [u.id, u.email ?? '']))
    admins = (rows ?? [])
      .map(r => ({
        user_id: r.user_id,
        email: emailById.get(r.user_id) ?? '(unknown)',
        isSelf: r.user_id === session.user.id,
      }))
      .sort((a, b) => a.email.localeCompare(b.email))
  }

  return (
    <AccountPageClient
      email={session.user.email ?? ''}
      isAdmin={isAdmin}
      initialAdmins={admins}
    />
  )
}
