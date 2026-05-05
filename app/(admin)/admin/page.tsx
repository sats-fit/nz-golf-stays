import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import Link from 'next/link'

export const metadata = {
  title: 'Admin — NZ Golf Stays',
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  const admin = createSupabaseAdminClient()

  // Check admin role
  const { data: adminRow } = await admin
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single()

  if (!adminRow) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <p className="text-brand-muted">You are not authorised to access this page.</p>
      </div>
    )
  }

  const [{ data: pending = [] }, { data: approved = [] }] = await Promise.all([
    admin.from('courses').select('*').eq('approved', false).order('created_at', { ascending: false }),
    admin.from('courses').select('*').eq('approved', true).order('name', { ascending: true }),
  ])

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="sticky top-0 z-20 bg-white border-b border-brand-border px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo-mark-circle.png" alt="NZ Golf Stays" className="w-7 h-7" />
              <span className="font-display font-semibold text-[15px] text-brand-green tracking-tight leading-none">
                NZ Golf Stays
              </span>
            </Link>
            <span className="text-brand-border">·</span>
            <span className="text-sm font-medium text-brand-muted">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-brand-muted hover:text-brand-navy transition-colors">
              ← Back to site
            </Link>
            <form action="/auth/signout" method="POST">
              <button className="text-sm text-brand-muted hover:text-brand-navy transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <AdminDashboard pendingCourses={pending ?? []} approvedCourses={approved ?? []} />
    </div>
  )
}
