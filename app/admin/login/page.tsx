'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-brand-border p-8 w-full max-w-sm shadow-sm">
        <div className="flex flex-col items-center mb-7">
          <img src="/logo-mark-circle.png" alt="NZ Golf Stays" className="w-12 h-12 mb-3" />
          <span className="font-display font-semibold text-lg text-brand-green tracking-tight">NZ Golf Stays</span>
          <span className="text-xs text-brand-muted mt-0.5">Admin</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-green text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
