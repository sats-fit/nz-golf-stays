'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { AuthModal } from './AuthModal'

type AuthContextType = {
  session: Session | null
  wishlisted: Set<string>
  toggleWishlist: (courseId: string) => Promise<void>
  openAuthModal: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  wishlisted: new Set(),
  toggleWishlist: async () => {},
  openAuthModal: () => {},
  isAdmin: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createSupabaseBrowserClient()

  // Track session
  useEffect(() => {
    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => setSession(res.data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: string, session: Session | null) => {
      setSession(session)
      if (session) setShowModal(false)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Load wishlist when session changes
  useEffect(() => {
    if (!session) { setWishlisted(new Set()); return }
    supabase
      .from('wishlists')
      .select('course_id')
      .then(({ data }: { data: { course_id: string }[] | null }) => {
        if (data) setWishlisted(new Set(data.map(r => r.course_id)))
      })
  }, [session, supabase])

  // Track admin status
  useEffect(() => {
    if (!session) { setIsAdmin(false); return }
    let cancelled = false
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(({ isAdmin }) => { if (!cancelled) setIsAdmin(!!isAdmin) })
      .catch(() => { if (!cancelled) setIsAdmin(false) })
    return () => { cancelled = true }
  }, [session])

  const toggleWishlist = useCallback(async (courseId: string) => {
    if (!session) { setShowModal(true); return }
    const isSaved = wishlisted.has(courseId)
    setWishlisted(prev => {
      const next = new Set(prev)
      if (isSaved) next.delete(courseId)
      else next.add(courseId)
      return next
    })
    if (isSaved) {
      await supabase.from('wishlists').delete().eq('course_id', courseId)
    } else {
      await supabase.from('wishlists').insert({ course_id: courseId, user_id: session.user.id })
    }
  }, [session, wishlisted, supabase])

  return (
    <AuthContext.Provider value={{ session, wishlisted, toggleWishlist, openAuthModal: () => setShowModal(true), isAdmin }}>
      {children}
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </AuthContext.Provider>
  )
}
