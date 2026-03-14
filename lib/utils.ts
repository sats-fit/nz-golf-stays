import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { StayNPlayOption, DogsOption } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stayNPlayLabel(value: StayNPlayOption): string {
  switch (value) {
    case 'yes': return 'Stay & Play'
    case 'free_with_gf': return 'Free w/ GF'
    case 'no': return 'No'
  }
}

export function dogsLabel(value: DogsOption): string {
  switch (value) {
    case 'yes': return 'Dogs OK'
    case 'no': return 'No Dogs'
    case 'unknown': return 'Unknown'
  }
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')
}
