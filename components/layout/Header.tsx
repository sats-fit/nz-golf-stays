'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { StaysToggle } from '@/components/filters/StaysToggle'
import { useAuth } from '@/components/auth/AuthProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { ViewMode, ViewToggle } from '@/components/ui/ViewToggle'
import { useFilters } from '@/hooks/useFilters'
import { NZ_REGIONS } from '@/lib/constants'
import { FilterState } from '@/lib/types'

type DesktopNav = {
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  wishlistOnly: boolean
  onWishlistToggle: () => void
  courseCount: number
}

type MobileNav = {
  onFiltersOpen: () => void
  activeFilterCount: number
}

export function Header({
  mobileNav,
  desktopNav,
}: {
  mobileNav?: MobileNav
  desktopNav?: DesktopNav
}) {
  const { session, openAuthModal } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  if (desktopNav) {
    return (
      <header className="sticky top-0 z-20 bg-white border-b border-brand-border">
        {/* Row 1: logo | avatar */}
        <div className="flex items-center justify-between px-8 py-3.5">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo-mark-circle.png" alt="NZ Golf Stays" className="w-8 h-8" />
            <span className="font-display font-semibold text-[17px] text-brand-green tracking-tight leading-none">
              NZ Golf Stays
            </span>
          </Link>
          <AvatarButton session={session} onClick={() => setMenuOpen(o => !o)} />
        </div>

        {/* Row 2: stays toggle + filter chips + view cluster */}
        <Suspense>
          <FilterChipRow
            view={desktopNav.view}
            onViewChange={desktopNav.onViewChange}
            wishlistOnly={desktopNav.wishlistOnly}
            onWishlistToggle={desktopNav.onWishlistToggle}
            courseCount={desktopNav.courseCount}
          />
        </Suspense>

        <HeaderDropdown
          menuOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          session={session}
          onSignOut={handleSignOut}
          onSignIn={() => { openAuthModal(); setMenuOpen(false) }}
        />
      </header>
    )
  }

  // Mobile layout — minimal header: logo + filters icon + avatar
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-brand-border px-4 py-3 relative">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-mark-circle.png" alt="NZ Golf Stays" className="w-8 h-8" />
          <span className="font-display font-semibold text-[15px] text-brand-green tracking-tight leading-none">
            NZ Golf Stays
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {mobileNav && (
            <button
              onClick={mobileNav.onFiltersOpen}
              aria-label="Open filters"
              className="relative w-10 h-10 rounded-full border border-brand-border bg-white flex items-center justify-center hover:bg-brand-surface transition-colors"
            >
              <FiltersButtonIcon />
              {mobileNav.activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center">
                  {mobileNav.activeFilterCount}
                </span>
              )}
            </button>
          )}
          <AvatarButton session={session} onClick={() => setMenuOpen(o => !o)} />
        </div>
      </div>

      <HeaderDropdown
        menuOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        session={session}
        onSignOut={handleSignOut}
        onSignIn={() => { openAuthModal(); setMenuOpen(false) }}
      />
    </header>
  )
}

// ─── Filter chip row ─────────────────────────────────────────────────────────

function FilterChipRow({
  view, onViewChange,
  wishlistOnly, onWishlistToggle, courseCount,
}: {
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  wishlistOnly: boolean
  onWishlistToggle: () => void
  courseCount: number
}) {
  const { filters, setFilter } = useFilters()
  const { wishlisted, session, openAuthModal } = useAuth()
  const [regionOpen, setRegionOpen] = useState(false)
  const [stayTypeOpen, setStayTypeOpen] = useState(false)

  const stayTypeCount = [
    filters.free_with_green_fees,
    filters.stay_no_play,
    filters.stay_with_play,
    filters.donation,
  ].filter(Boolean).length

  const toggle = (key: keyof FilterState) => setFilter(key, !filters[key as keyof FilterState] as never)

  return (
    <div className="flex items-center gap-2 px-8 pb-3">
      {/* Stays toggle */}
      <StaysToggle count={courseCount} />

      <div className="w-px h-6 bg-brand-border mx-1 shrink-0" />

      {/* Region */}
      <div className="relative shrink-0">
        <FilterChip
          active={!!filters.region}
          hasChevron
          onClick={() => { setRegionOpen(o => !o); setStayTypeOpen(false) }}
        >
          <MapPinIcon active={!!filters.region} />
          {filters.region || 'All regions'}
        </FilterChip>

        {regionOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setRegionOpen(false)} />
            <div className="absolute top-full mt-1 left-0 z-50 bg-white rounded-xl border border-brand-border shadow-lg py-1 min-w-[190px] max-h-72 overflow-y-auto">
              {['', ...NZ_REGIONS].map(r => (
                <button
                  key={r || 'all'}
                  onClick={() => { setFilter('region', r); setRegionOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    filters.region === r
                      ? 'text-brand-green font-semibold bg-brand-surface'
                      : 'text-brand-navy hover:bg-brand-surface'
                  }`}
                >
                  {r || 'All regions'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Saved */}
      <FilterChip
        active={wishlistOnly}
        onClick={() => {
          if (!session) { openAuthModal(); return }
          onWishlistToggle()
        }}
      >
        <HeartChipIcon active={wishlistOnly} />
        Saved{wishlisted.size > 0 ? ` · ${wishlisted.size}` : ''}
      </FilterChip>

      {/* Stay type */}
      <div className="relative shrink-0">
        <FilterChip
          active={stayTypeCount > 0}
          hasChevron
          onClick={() => { setStayTypeOpen(o => !o); setRegionOpen(false) }}
        >
          <SlidersIcon active={stayTypeCount > 0} />
          Stay type{stayTypeCount > 0 ? ` · ${stayTypeCount}` : ''}
        </FilterChip>
        {stayTypeOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setStayTypeOpen(false)} />
            <div className="absolute top-full mt-1 left-0 z-50 bg-white rounded-xl border border-brand-border shadow-lg py-2 min-w-[260px]">
              {([
                { key: 'free_with_green_fees', label: 'Free with green fees',  sub: 'Stay free if you pay green fees' },
                { key: 'stay_no_play',         label: 'Pay to stay (no play)', sub: 'Allowed without playing — paid' },
                { key: 'stay_with_play',       label: 'Pay to stay & play',    sub: 'Stay with golf — paid' },
                { key: 'donation',             label: 'Donation accepted',      sub: undefined },
              ] as { key: keyof FilterState; label: string; sub?: string }[]).map(({ key, label, sub }) => {
                const active = !!filters[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-brand-surface transition-colors"
                  >
                    <span className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      active ? 'bg-brand-green border-brand-green' : 'border-gray-300'
                    }`}>
                      {active && <CheckIcon />}
                    </span>
                    <span>
                      <span className="block text-sm text-brand-navy font-medium">{label}</span>
                      {sub && <span className="block text-xs text-brand-muted mt-0.5">{sub}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <FilterChip active={filters.power} onClick={() => toggle('power')}>
        <PlugIcon active={filters.power} /> Powered
      </FilterChip>

      <FilterChip active={filters.dogs} onClick={() => toggle('dogs')}>
        <PawIcon active={filters.dogs} /> Dogs OK
      </FilterChip>

      <div className="flex-1 min-w-4" />

      {/* View toggle */}
      <ViewToggle view={view} onChange={onViewChange} />
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function FilterChip({
  active = false,
  onClick,
  hasChevron = false,
  children,
}: {
  active?: boolean
  onClick?: () => void
  hasChevron?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-brand-green border-brand-green text-white'
          : 'bg-white border-brand-border text-brand-navy hover:border-gray-300'
      }`}
    >
      {children}
      {hasChevron && <ChevronDownIcon active={active} />}
    </button>
  )
}

function AvatarButton({ session, onClick }: { session: ReturnType<typeof useAuth>['session']; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
      aria-label="Menu"
    >
      {session?.user.user_metadata?.avatar_url ? (
        <img
          src={session.user.user_metadata.avatar_url}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold">
          {session?.user.email
            ? session.user.email.slice(0, 2).toUpperCase()
            : <HamburgerIcon />}
        </div>
      )}
    </button>
  )
}

function HeaderDropdown({
  menuOpen, onClose, session, onSignOut, onSignIn,
}: {
  menuOpen: boolean
  onClose: () => void
  session: ReturnType<typeof useAuth>['session']
  onSignOut: () => void
  onSignIn: () => void
}) {
  const { isAdmin } = useAuth()
  if (!menuOpen) return null
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-4 md:right-8 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-brand-border py-1 z-40">
        {session ? (
          <>
            <div className="px-4 py-2 text-xs text-brand-muted truncate">{session.user.email}</div>
            <div className="h-px bg-brand-border mx-2" />
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-surface"
            >
              <HeartIcon filled size={14} />
              My Wishlist
            </Link>
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-surface"
            >
              <UserIcon size={14} />
              Account settings
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-surface"
              >
                <ShieldIcon size={14} />
                Admin dashboard
              </Link>
            )}
            <div className="h-px bg-brand-border mx-2" />
            <button
              onClick={onSignOut}
              className="w-full text-left px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-surface"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={onSignIn}
            className="w-full text-left px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-surface"
          >
            Sign in / Sign up
          </button>
        )}
      </div>
    </>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────


function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function HeartIcon({ filled = false, size = 16 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function HeartChipIcon({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function MapPinIcon({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#5A6B85'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function SlidersIcon({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#5A6B85'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

function PlugIcon({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#5A6B85'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8H6a3 3 0 0 0-3 3v1a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3z" />
    </svg>
  )
}

function PawIcon({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? '#fff' : 'none'} stroke={active ? '#fff' : '#5A6B85'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="7" cy="14" r="2" />
      <path d="M14.5 17c0 2-1.5 3.5-3.5 3.5S7.5 19 7.5 17c0-1.5 1-3 2.5-4s3 2.5 4.5 4z" />
    </svg>
  )
}

function ChevronDownIcon({ active }: { active?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? 'rgba(255,255,255,0.7)' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function FiltersButtonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}
