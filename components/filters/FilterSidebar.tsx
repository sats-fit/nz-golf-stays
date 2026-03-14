'use client'

import { useFilters } from '@/hooks/useFilters'
import { FILTER_DEFINITIONS, NZ_REGIONS } from '@/lib/constants'

export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useFilters()

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'search') return false
    return v !== false && v !== ''
  })

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
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

        {/* Boolean filters */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Stay Options</p>
          <div className="space-y-3">
            {FILTER_DEFINITIONS.map(f => (
              <label key={f.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters[f.key as keyof typeof filters]}
                  onChange={e => setFilter(f.key as keyof typeof filters, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-700 font-medium">{f.label}</span>
                  <p className="text-xs text-gray-400">{f.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
