'use client'

import { Header } from '@/components/layout/Header'
import { AdminManagement } from './AdminManagement'

export type AdminEntry = {
  user_id: string
  email: string
  isSelf: boolean
}

export function AccountPageClient({
  email,
  isAdmin,
  initialAdmins,
}: {
  email: string
  isAdmin: boolean
  initialAdmins: AdminEntry[]
}) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-surface">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="font-display text-3xl text-brand-navy mb-1">Account</h1>
        <p className="text-sm text-brand-muted mb-8">Manage your profile and settings.</p>

        <section className="bg-white rounded-2xl border border-brand-border p-6 mb-6">
          <h2 className="text-base font-semibold text-brand-navy mb-4">Profile</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-muted">Email</span>
            <span className="text-brand-navy font-medium">{email}</span>
          </div>
        </section>

        {isAdmin && (
          <section className="bg-white rounded-2xl border border-brand-border p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-brand-navy">Team admins</h2>
              <p className="text-sm text-brand-muted mt-1">
                Admins can approve course submissions, edit listings, and manage this list.
              </p>
            </div>
            <AdminManagement initialAdmins={initialAdmins} />
          </section>
        )}
      </main>
    </div>
  )
}
