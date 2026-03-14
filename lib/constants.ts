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
  { key: 'stay_n_play', label: 'Stay & Play', description: 'Stay overnight and play golf' },
  { key: 'free_with_gf', label: 'Free w/ Green Fees', description: 'Free stay when you play' },
  { key: 'stay_no_play', label: 'Stay No Play', description: 'Stay without playing golf' },
  { key: 'dogs', label: 'Dogs OK', description: 'Dogs are welcome' },
  { key: 'power', label: 'Power', description: 'Electrical hookup available' },
  { key: 'ask_first', label: 'Ask First', description: 'Contact the course to arrange stay' },
] as const

export type FilterKey = (typeof FILTER_DEFINITIONS)[number]['key']
