import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm',
      'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
      'placeholder:text-gray-400',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'
