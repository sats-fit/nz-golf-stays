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
  const { data: courses = [] } = await admin
    .from('courses')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Site
            </Link>
            <span className="text-green-600 font-semibold">NZ Golf Stays · Admin</span>
          </div>
          <form action="/auth/signout" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
          </form>
        </div>
      </header>
      <AdminDashboard initialCourses={courses ?? []} />
    </div>
  )
}
