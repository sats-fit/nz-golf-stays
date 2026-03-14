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

  return {
    overnight_stays: bool('overnight_stays'),
    stay_n_play: bool('stay_n_play'),
    stay_no_play: bool('stay_no_play'),
    dogs: bool('dogs'),
    power: bool('power'),
    free_with_gf: bool('free_with_gf'),
    ask_first: bool('ask_first'),
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
