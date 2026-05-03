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

  // overnight_stays defaults ON: only off when explicitly ?overnight_stays=false
  const stays = params.get('overnight_stays')
  const filters: FilterState = {
    overnight_stays: stays !== 'false',
    free_with_green_fees: params.get('free_with_green_fees') === 'true',
    stay_no_play: params.get('stay_no_play') === 'true',
    stay_with_play: params.get('stay_with_play') === 'true',
    donation: params.get('donation') === 'true',
    power: params.get('power') === 'true',
    dogs: params.get('dogs') === 'true',
    booking_required: params.get('booking_required') === 'true',
    region: params.get('region') ?? '',
    search: params.get('search') ?? '',
  }

  const setFilter = (key: keyof FilterState, value: string | boolean) => {
    const newParams = new URLSearchParams(params.toString())
    // overnight_stays is default-true: write 'false' explicitly when toggled off,
    // and clear the param when toggled back on (so URLs stay clean for the default state).
    if (key === 'overnight_stays') {
      if (value === false) newParams.set('overnight_stays', 'false')
      else newParams.delete('overnight_stays')
    } else if (value === false || value === '') {
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
