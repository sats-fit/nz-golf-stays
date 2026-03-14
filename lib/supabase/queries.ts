import { SupabaseClient } from '@supabase/supabase-js'
import { FilterState } from '../types'

export async function getCourses(filters: Partial<FilterState>, supabase: SupabaseClient) {
  let query = supabase
    .from('courses')
    .select('*')
    .eq('approved', true)
    .order('name')

  if (filters.region) query = query.eq('region', filters.region)
  if (filters.overnight_stays) query = query.eq('overnight_stays', true)
  if (filters.dogs) query = query.eq('dogs', 'yes')
  if (filters.power) query = query.eq('power', true)
  if (filters.stay_n_play) query = query.eq('stay_n_play', 'yes')
  if (filters.free_with_gf) query = query.eq('stay_n_play', 'free_with_gf')
  if (filters.stay_no_play) query = query.eq('stay_no_play', true)
  if (filters.ask_first) query = query.eq('ask_first', true)
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)

  return query
}

export async function getCourseById(id: string, supabase: SupabaseClient) {
  return supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('approved', true)
    .single()
}
