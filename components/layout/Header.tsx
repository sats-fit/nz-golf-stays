'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/filters/SearchBar'
import { StaysToggle } from '@/components/filters/StaysToggle'
import { useAuth } from '@/components/auth/AuthProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { ViewMode } from '@/components/ui/ViewToggle'
import { MobileFilterBar } from '@/components/mobile/MobileFilterBar'

export function Header({
  mobileNav,
}: {
  mobileNav?: {
    view: ViewMode
    onViewChange: (v: ViewMode) => void
    wishlistOnly: boolean
    onWishlistToggle: () => void
  }
} = {}) {
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
          <GolfFlagIcon className="w-7 h-7 text-green-600" />
        </Link>
        <Suspense>
          <SearchBar />
        </Suspense>
        {/* Stays-only pill — primary product filter, always visible */}
        <Suspense>
          <StaysToggle className="ml-auto" />
        </Suspense>
        {/* Avatar / Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="shrink-0 rounded-full hover:opacity-80 transition-opacity"
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

      {/* Mobile nav row — Saved + view toggle */}
      {mobileNav && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          {/* Left: Saved + filter buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!session) { openAuthModal(); return }
                mobileNav.onWishlistToggle()
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                mobileNav.wishlistOnly
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={mobileNav.wishlistOnly ? '#ef4444' : 'none'} stroke={mobileNav.wishlistOnly ? '#ef4444' : 'currentColor'} strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Saved
            </button>
            <MobileFilterBar />
          </div>
          {/* Right: Map/List toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
            {(['map', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => mobileNav.onViewChange(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mobileNav.view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {v === 'map' ? (
                  <><MapIconSm /><span>Map</span></>
                ) : (
                  <><ListIconSm /><span>List</span></>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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

function MapIconSm() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ListIconSm() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function GolfFlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="21" />
      <path d="M6 3l12 5-12 5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}
