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
  if (filters.free_with_green_fees) query = query.eq('free_with_green_fees', true)
  if (filters.stay_no_play) query = query.eq('stay_no_play_allowed', true)
  if (filters.stay_with_play) query = query.eq('stay_with_play_allowed', true)
  if (filters.donation) query = query.eq('donation_accepted', true)
  if (filters.booking_required) query = query.in('booking', ['ask_first', 'must_book'])
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
