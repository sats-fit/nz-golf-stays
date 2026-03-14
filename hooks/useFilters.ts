'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FilterState } from '@/lib/types'

export function useFilters(): {
  filters: FilterState
  setFilter: (key: keyof FilterState, value: string | boolean) => void
  clearFilters: () => void
} {
  const router = useRouter()
  const params = useSearchParams()

  const filters: FilterState = {
    overnight_stays: params.get('overnight_stays') === 'true',
    stay_n_play: params.get('stay_n_play') === 'true',
    stay_no_play: params.get('stay_no_play') === 'true',
    dogs: params.get('dogs') === 'true',
    power: params.get('power') === 'true',
    free_with_gf: params.get('free_with_gf') === 'true',
    ask_first: params.get('ask_first') === 'true',
    region: params.get('region') ?? '',
    search: params.get('search') ?? '',
  }

  const setFilter = (key: keyof FilterState, value: string | boolean) => {
    const newParams = new URLSearchParams(params.toString())
    if (value === false || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    router.push(`/?${newParams.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push('/', { scroll: false })
  }

  return { filters, setFilter, clearFilters }
}
