'use client'

import { useEffect } from 'react'
import { useFilters } from '@/hooks/useFilters'
import { NZ_REGIONS } from '@/lib/constants'
import { FilterState } from '@/lib/types'
import { useAuth } from '@/components/auth/AuthProvider'

const STAY_TYPES: { key: keyof FilterState; label: string; sub?: string }[] = [
  { key: 'free_with_green_fees', label: 'Free with green fees', sub: 'Stay free if you pay green fees' },
  { key: 'stay_no_play',         label: 'Pay to stay (no play)', sub: 'Allowed without playing — paid' },
  { key: 'stay_with_play',       label: 'Pay to stay & play',    sub: 'Stay with golf — paid' },
  { key: 'donation',             label: 'Donation accepted' },
]

export function MobileFiltersSheet({
  open,
  onClose,
  count,
  wishlistOnly,
  onWishlistToggle,
}: {
  open: boolean
  onClose: () => void
  count: number
  wishlistOnly: boolean
  onWishlistToggle: () => void
}) {
  const { filters, setFilter, clearFilters } = useFilters()
  const { session, openAuthModal } = useAuth()

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const toggle = (key: keyof FilterState) => setFilter(key, !filters[key] as never)

  const handleClearAll = () => {
    clearFilters()
    if (wishlistOnly) onWishlistToggle()
  }

  const handleSavedTap = () => {
    if (!session) { openAuthModal(); return }
    onWishlistToggle()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-slide-up">
      {/* Header */}
      <div className="relative flex items-center justify-center px-4 py-3 border-b border-brand-border shrink-0">
        <button
          onClick={onClose}
          aria-label="Close filters"
          className="absolute left-3 w-9 h-9 rounded-full flex items-center justify-center hover:bg-brand-surface transition-colors"
        >
          <CloseIcon />
        </button>
        <h2 className="text-base font-semibold text-brand-navy">Filters</h2>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-24">
        {/* Stays availability */}
        <Section title="Show">
          <div className="grid grid-cols-2 gap-2">
            <SegmentButton
              active={filters.overnight_stays}
              onClick={() => setFilter('overnight_stays', true)}
              label="Stays only"
            />
            <SegmentButton
              active={!filters.overnight_stays}
              onClick={() => setFilter('overnight_stays', false)}
              label="All courses"
            />
          </div>
        </Section>

        <Divider />

        {/* Region */}
        <Section title="Region">
          <div className="flex flex-wrap gap-2">
            <ChipPill
              active={!filters.region}
              onClick={() => setFilter('region', '')}
              label="All regions"
            />
            {NZ_REGIONS.map(r => (
              <ChipPill
                key={r}
                active={filters.region === r}
                onClick={() => setFilter('region', r)}
                label={r}
              />
            ))}
          </div>
        </Section>

        <Divider />

        {/* Stay type */}
        <Section title="Stay type">
          <div className="space-y-1">
            {STAY_TYPES.map(({ key, label, sub }) => (
              <CheckRow
                key={key}
                active={!!filters[key]}
                onClick={() => toggle(key)}
                label={label}
                sub={sub}
              />
            ))}
          </div>
        </Section>

        <Divider />

        {/* Amenities */}
        <Section title="Amenities & booking">
          <div className="space-y-1">
            <CheckRow active={filters.power} onClick={() => toggle('power')} label="Powered sites" />
            <CheckRow active={filters.dogs} onClick={() => toggle('dogs')} label="Dogs OK" />
            <CheckRow active={filters.booking_required} onClick={() => toggle('booking_required')} label="Ask / Book ahead" />
          </div>
        </Section>

        <Divider />

        {/* Saved */}
        <Section title="Saved">
          <CheckRow
            active={wishlistOnly}
            onClick={handleSavedTap}
            label="My saved courses only"
            sub={!session ? 'Sign in to use saved courses' : undefined}
          />
        </Section>
      </div>

      {/* Sticky footer */}
      <div className="absolute inset-x-0 bottom-0 bg-white border-t border-brand-border px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={handleClearAll}
          className="text-sm font-medium text-brand-navy underline underline-offset-4"
        >
          Clear all
        </button>
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-full bg-brand-green text-white text-sm font-semibold hover:bg-brand-green-dark transition-colors"
        >
          Show {count} {count === 1 ? 'course' : 'courses'}
        </button>
      </div>
    </div>
  )
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-5">
      <h3 className="text-base font-semibold text-brand-navy mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-brand-border mx-5" />
}

function SegmentButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
        active
          ? 'bg-brand-green border-brand-green text-white'
          : 'bg-white border-brand-border text-brand-navy'
      }`}
    >
      {label}
    </button>
  )
}

function ChipPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-all ${
        active
          ? 'bg-brand-green border-brand-green text-white'
          : 'bg-white border-brand-border text-brand-navy'
      }`}
    >
      {label}
    </button>
  )
}

function CheckRow({
  active, onClick, label, sub,
}: {
  active: boolean
  onClick: () => void
  label: string
  sub?: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-2 py-3 rounded-lg hover:bg-brand-surface transition-colors text-left"
    >
      <span className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
        active ? 'bg-brand-green border-brand-green' : 'border-gray-300 bg-white'
      }`}>
        {active && <CheckIcon />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm text-brand-navy font-medium">{label}</span>
        {sub && <span className="block text-xs text-brand-muted mt-0.5">{sub}</span>}
      </span>
    </button>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
