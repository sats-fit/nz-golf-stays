import { cn } from '@/lib/utils'

type BadgeVariant = 'green' | 'blue' | 'yellow' | 'gray' | 'orange'

const variants: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray: 'bg-gray-100 text-gray-600',
  orange: 'bg-orange-100 text-orange-800',
}

export function Badge({
  children,
  variant = 'gray',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
