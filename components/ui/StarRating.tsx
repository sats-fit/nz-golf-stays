import { Course } from '@/lib/types'

export function StarRating({ course, size = 'sm' }: { course: Course; size?: 'sm' | 'md' }) {
  if (!course.google_rating || !course.google_place_id) return null

  const rating = course.google_rating
  const count = course.google_rating_count
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${course.google_place_id}`
  const starSize = size === 'md' ? 16 : 13

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 hover:underline w-fit"
      onClick={e => e.stopPropagation()}
    >
      <span className={`font-semibold text-gray-800 ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
        {rating.toFixed(1)}
      </span>
      <Stars rating={rating} size={starSize} />
      {count != null && (
        <span className={`text-gray-400 ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </a>
  )
}

function Stars({ rating, size }: { rating: number; size: number }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map(i => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)))
        return <Star key={i} fill={fill} size={size} />
      })}
    </span>
  )
}

function Star({ fill, size }: { fill: number; size: number }) {
  const id = `grad-${Math.random().toString(36).slice(2)}`
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
          <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <path
        d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
