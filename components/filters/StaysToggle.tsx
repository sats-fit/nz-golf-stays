'use client'

import { useFilters } from '@/hooks/useFilters'

export function StaysToggle({ className = '' }: { className?: string }) {
  const { filters, setFilter } = useFilters()
  const on = filters.overnight_stays

  return (
    <button
      onClick={() => setFilter('overnight_stays', !on)}
      aria-pressed={on}
      title={on ? 'Showing only courses that allow overnight stays' : 'Showing all courses'}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
        on
          ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
      } ${className}`}
    >
      <span className="text-base leading-none">{on ? '🏕️' : '⛳'}</span>
      <span className="whitespace-nowrap">{on ? 'Stays only' : 'All courses'}</span>
    </button>
  )
}
