'use client'

import { useFilters } from '@/hooks/useFilters'

export function StaysToggle({ className = '', count }: { className?: string; count?: number }) {
  const { filters, setFilter } = useFilters()
  const on = filters.overnight_stays

  return (
    <button
      onClick={() => setFilter('overnight_stays', !on)}
      aria-pressed={on}
      className={`shrink-0 inline-flex items-center gap-3.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm ${
        on
          ? 'bg-brand-green border-brand-green text-white hover:bg-brand-green-dark'
          : 'bg-white border-gray-300 text-brand-navy hover:border-gray-400'
      } ${className}`}
    >
      <ToggleSwitch on={on} />
      <span>{on ? 'Stays only' : 'All courses'}</span>
      {count !== undefined && (
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            on ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative flex-shrink-0 w-11 h-[26px] rounded-full border transition-colors ${
        on ? 'bg-white/20 border-white/30' : 'bg-gray-100 border-gray-200'
      }`}
    >
      <span
        className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all duration-200 flex items-center justify-center shadow-sm ${
          on ? 'left-[22px]' : 'left-[3px]'
        }`}
      >
        {on ? <VanIcon /> : <FlagIcon />}
      </span>
    </span>
  )
}

function VanIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2D5F3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="13" height="8" rx="1.5" />
      <path d="M15 12h4l2 3v2h-6" />
      <circle cx="6" cy="18" r="1.5" fill="#2D5F3F" stroke="none" />
      <circle cx="17" cy="18" r="1.5" fill="#2D5F3F" stroke="none" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}
