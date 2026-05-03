import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCourses } from '@/lib/supabase/queries'
import { FilterState } from '@/lib/types'
import { HomePage } from '@/components/HomePage'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function parseFilters(params: Record<string, string | string[] | undefined>): Partial<FilterState> {
  const str = (key: string) => {
    const v = params[key]
    return typeof v === 'string' ? v : ''
  }
  const bool = (key: string) => str(key) === 'true'

  // overnight_stays defaults ON: only off when explicitly ?overnight_stays=false
  return {
    overnight_stays: str('overnight_stays') !== 'false',
    free_with_green_fees: bool('free_with_green_fees'),
    stay_no_play: bool('stay_no_play'),
    stay_with_play: bool('stay_with_play'),
    donation: bool('donation'),
    power: bool('power'),
    dogs: bool('dogs'),
    booking_required: bool('booking_required'),
    region: str('region'),
    search: str('search'),
  }
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const filters = parseFilters(params)

  const supabase = await createSupabaseServerClient()
  const { data: courses = [] } = await getCourses(filters, supabase)

  return <HomePage courses={courses ?? []} />
}
