'use client'

import { useFilters } from '@/hooks/useFilters'
import { useEffect, useState } from 'react'

export function SearchBar() {
  const { filters, setFilter } = useFilters()
  const [value, setValue] = useState(filters.search)

  // Sync local state when URL changes
  useEffect(() => {
    setValue(filters.search)
  }, [filters.search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter('search', value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(''); setFilter('search', '') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </form>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
