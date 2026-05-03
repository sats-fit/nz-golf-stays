'use client'

import { useFilters } from '@/hooks/useFilters'
import { NZ_REGIONS } from '@/lib/constants'
import { FilterState } from '@/lib/types'

export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useFilters()

  // overnight_stays is shown in the header pill, not the sidebar — but it's still
  // an "active filter" when off (default is on), so don't count it here.
  const hasActiveFilters = (
    filters.region !== '' ||
    filters.free_with_green_fees ||
    filters.stay_no_play ||
    filters.stay_with_play ||
    filters.donation ||
    filters.power ||
    filters.dogs ||
    filters.booking_required
  )

  const toggle = (key: keyof FilterState) =>
    setFilter(key, !filters[key])

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto sticky top-[57px] self-start h-[calc(100vh-57px)]">
      <div className="p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <select
            value={filters.region}
            onChange={e => setFilter('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All regions</option>
            {NZ_REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Stay type */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Stay Type</p>
          <div className="space-y-2.5">
            <FilterCheckbox
              checked={filters.free_with_green_fees}
              onChange={() => toggle('free_with_green_fees')}
              label="Free with green fees"
              description="Stay free if you pay green fees"
            />
            <FilterCheckbox
              checked={filters.stay_no_play}
              onChange={() => toggle('stay_no_play')}
              label="Pay to stay (no play)"
              description="Allowed without playing — paid"
            />
            <FilterCheckbox
              checked={filters.stay_with_play}
              onChange={() => toggle('stay_with_play')}
              label="Pay to stay & play"
              description="Stay with golf — paid"
            />
            <FilterCheckbox
              checked={filters.donation}
              onChange={() => toggle('donation')}
              label="Donation accepted"
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Amenities</p>
          <div className="space-y-2.5">
            <FilterCheckbox
              checked={filters.power}
              onChange={() => toggle('power')}
              label="Powered sites"
              description="Electrical hookup available"
            />
            <FilterCheckbox
              checked={filters.dogs}
              onChange={() => toggle('dogs')}
              label="Dogs OK"
              description="Dogs are welcome"
            />
            <FilterCheckbox
              checked={filters.booking_required}
              onChange={() => toggle('booking_required')}
              label="Ask/Book Ahead"
              description="Need to contact course first"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: () => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
      <div>
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
    </label>
  )
}
