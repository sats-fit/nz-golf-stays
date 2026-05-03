import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PricingType, BookingOption, DogsOption, StayUnit, PowerUnit } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pricingTypeLabel(value: PricingType): string {
  switch (value) {
    case 'free': return 'Free'
    case 'free_with_green_fees': return 'Free w/ Green Fees'
    case 'per_vehicle': return 'Per Vehicle'
    case 'per_person': return 'Per Person'
    case 'donation': return 'Donation'
    case 'unknown': return 'Unknown'
  }
}

export function bookingLabel(value: BookingOption): string {
  switch (value) {
    case 'walk_in': return 'Walk-ins welcome'
    case 'ask_first': return 'Ask first'
    case 'must_book': return 'Must book ahead'
    case 'unknown': return 'Unknown'
  }
}

export function dogsLabel(value: DogsOption): string {
  switch (value) {
    case 'yes': return 'Dogs OK'
    case 'no': return 'No Dogs'
    case 'unknown': return 'Unknown'
  }
}

export function stayUnitLabel(unit: StayUnit | PowerUnit | null | undefined, opts?: { short?: boolean }): string {
  const short = opts?.short ?? false
  switch (unit) {
    case 'per_night':            return short ? '/night' : 'per night'
    case 'per_person':           return short ? '/person' : 'per person'
    case 'per_vehicle':          return short ? '/vehicle' : 'per vehicle'
    case 'per_person_per_night': return short ? '/person/night' : 'per person per night'
    default: return ''
  }
}

export function formatStayPrice(
  price: number | null | undefined,
  unit: StayUnit | PowerUnit | null | undefined,
  opts?: { short?: boolean },
): string {
  if (price == null) return ''
  const dollar = `$${Number.isInteger(price) ? price : price.toFixed(2)}`
  const tail = stayUnitLabel(unit, opts)
  return tail ? `${dollar} ${tail}` : dollar
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')
}
