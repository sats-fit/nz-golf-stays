'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/filters/SearchBar'
import { useAuth } from '@/components/auth/AuthProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function Header() {
  const { session, openAuthModal } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 relative">
      <div className="flex items-center gap-4">
        <Link href="/" className="shrink-0">
          <span className="text-green-600 font-bold text-lg">NZ Golf Stays</span>
        </Link>
        <Suspense>
          <SearchBar />
        </Suspense>
        <Link
          href="/submit"
          className="shrink-0 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Course
        </Link>
        {/* Avatar / Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="shrink-0 ml-auto rounded-full hover:opacity-80 transition-opacity"
          aria-label="Menu"
        >
          {session?.user.user_metadata?.avatar_url ? (
            <img
              src={session.user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-green-500"
            />
          ) : (
            <div className="p-2 rounded-lg hover:bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-4 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-40">
            {session ? (
              <>
                <div className="px-4 py-2 text-xs text-gray-400 truncate">{session.user.email}</div>
                <div className="h-px bg-gray-100 mx-2" />
                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  My Wishlist
                </Link>
                <div className="h-px bg-gray-100 mx-2" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => { openAuthModal(); setMenuOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Sign in / Sign up
              </button>
            )}
          </div>
        </>
      )}
    </header>
  )
}
