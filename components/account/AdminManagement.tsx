'use client'

import { useState } from 'react'
import type { AdminEntry } from './AccountPageClient'

export function AdminManagement({ initialAdmins }: { initialAdmins: AdminEntry[] }) {
  const [admins, setAdmins] = useState<AdminEntry[]>(initialAdmins)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const refresh = async () => {
    const res = await fetch('/api/admin/admins')
    if (res.ok) {
      const { admins } = await res.json() as { admins: AdminEntry[] }
      setAdmins(admins)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    setAdding(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong' }))
      setError(error || 'Something went wrong')
      return
    }
    setEmail('')
    await refresh()
  }

  const handleRemove = async (userId: string, label: string) => {
    if (!confirm(`Remove ${label} as admin?`)) return
    setRemovingId(userId)
    setError(null)
    const res = await fetch(`/api/admin/admins?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
    setRemovingId(null)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong' }))
      setError(error || 'Something went wrong')
      return
    }
    await refresh()
  }

  return (
    <div>
      <ul className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden mb-5">
        {admins.length === 0 && (
          <li className="px-4 py-3 text-sm text-brand-muted">No admins yet.</li>
        )}
        {admins.map(a => (
          <li key={a.user_id} className="flex items-center justify-between px-4 py-3 bg-white">
            <div className="min-w-0">
              <div className="text-sm text-brand-navy truncate">{a.email}</div>
              {a.isSelf && <div className="text-xs text-brand-muted">You</div>}
            </div>
            {!a.isSelf && (
              <button
                onClick={() => handleRemove(a.user_id, a.email)}
                disabled={removingId === a.user_id}
                className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {removingId === a.user_id ? 'Removing…' : 'Remove'}
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="flex-1 px-3 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {adding ? 'Adding…' : 'Add admin'}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-brand-muted">
        The person must have signed in at least once before you can promote them.
      </p>
    </div>
  )
}
