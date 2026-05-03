export const NZ_REGIONS = [
  'Auckland',
  'Bay of Plenty',
  'Canterbury',
  'Gisborne',
  'Hawke\'s Bay',
  'Manawatu-Whanganui',
  'Marlborough',
  'Nelson',
  'Northland',
  'Otago',
  'Southland',
  'Taranaki',
  'Tasman',
  'Waikato',
  'Wellington',
  'West Coast',
] as const

export type NZRegion = (typeof NZ_REGIONS)[number]

export const FILTER_DEFINITIONS = [
  { key: 'overnight_stays', label: 'Overnight Stays', description: 'Allows motorhome overnight stays' },
  { key: 'free_with_green_fees', label: 'Free w/ Green Fees', description: 'Stay free if you pay green fees' },
  { key: 'stay_no_play', label: 'Pay to stay (no play)', description: 'Stay without playing — paid' },
  { key: 'stay_with_play', label: 'Pay to stay & play', description: 'Stay with green-fees-paid + extra' },
  { key: 'donation', label: 'Donation accepted', description: 'Donation-based stay' },
  { key: 'power', label: 'Powered sites', description: 'Electrical hookup available' },
  { key: 'dogs', label: 'Dogs OK', description: 'Dogs are welcome' },
  { key: 'booking_required', label: 'Ask/Book Ahead', description: 'Need to contact course first' },
] as const

export type FilterKey = (typeof FILTER_DEFINITIONS)[number]['key']
