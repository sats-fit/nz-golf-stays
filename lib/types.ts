export type PricingType = 'unknown' | 'free' | 'free_with_green_fees' | 'per_vehicle' | 'per_person' | 'donation'
export type BookingOption = 'unknown' | 'walk_in' | 'ask_first' | 'must_book'
export type DogsOption = 'yes' | 'no' | 'unknown'

export type StayUnit = 'per_night' | 'per_person' | 'per_vehicle' | 'per_person_per_night'
export type PowerUnit = 'per_night' | 'per_vehicle'

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

  // Stay options (v2 — set by 20260503_stay_options_v2.sql)
  free_with_green_fees: boolean
  stay_no_play_allowed: boolean
  stay_no_play_price: number | null
  stay_no_play_unit: StayUnit | null
  stay_with_play_allowed: boolean
  stay_with_play_price: number | null
  stay_with_play_unit: StayUnit | null
  donation_accepted: boolean

  // Amenities + booking
  dogs: DogsOption
  power: boolean
  power_additional_cost: number | null
  power_unit: PowerUnit | null
  booking: BookingOption

  // Legacy — kept for backwards compatibility until follow-up cleanup migration drops them.
  /** @deprecated use the flat stay_* / free_with_green_fees / donation_accepted fields */
  pricing_type: PricingType
  /** @deprecated use stay_no_play_price / stay_with_play_price */
  pricing_amount: string | null
  /** @deprecated use power_additional_cost + power_unit */
  power_cost: string | null

  photos: string[]
  google_place_id: string | null
  email: string | null
  google_rating: number | null
  google_rating_count: number | null
  photo_references: string[] | null
  approved: boolean
  submitted_by: string | null
  created_at: string
  updated_at: string
}

export type CourseInsert = Omit<Course, 'id' | 'created_at' | 'updated_at' | 'approved'>

export type FilterState = {
  overnight_stays: boolean
  free_with_green_fees: boolean
  stay_no_play: boolean
  stay_with_play: boolean
  donation: boolean
  power: boolean
  dogs: boolean
  booking_required: boolean
  region: string
  search: string
}
