export type StayNPlayOption = 'yes' | 'no' | 'free_with_gf'
export type DogsOption = 'yes' | 'no' | 'unknown'

export type Course = {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  region: string | null
  phone: string | null
  website: string | null
  notes: string | null
  overnight_stays: boolean
  stay_n_play: StayNPlayOption
  stay_no_play: boolean
  stay_no_play_price: string | null
  dogs: DogsOption
  power: boolean
  ask_first: boolean
  photos: string[]
  google_place_id: string | null
  email: string | null
  google_rating: number | null
  google_rating_count: number | null
  approved: boolean
  submitted_by: string | null
  created_at: string
  updated_at: string
}

export type CourseInsert = Omit<Course, 'id' | 'created_at' | 'updated_at' | 'approved'>

export type FilterState = {
  overnight_stays: boolean
  stay_n_play: boolean
  stay_no_play: boolean
  dogs: boolean
  power: boolean
  free_with_gf: boolean
  ask_first: boolean
  region: string
  search: string
}
