'use client'

import { Course } from '@/lib/types'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { StarRating } from '@/components/ui/StarRating'

function FeatureIcons({ course }: { course: Course }) {
  const features = [
    { icon: '🏕️', label: 'Overnight stays', active: course.overnight_stays },
    { icon: '🆓', label: 'Free w/ green fees', active: course.free_with_green_fees },
    { icon: '🐕', label: 'Dogs welcome', active: course.dogs === 'yes' },
    { icon: '⚡', label: 'Power hookup', active: course.power },
    { icon: '📋', label: 'Ask/Book ahead', active: course.booking === 'ask_first' || course.booking === 'must_book' },
  ]
  return (
    <div className="flex gap-3 mt-2">
      {features.map(f => (
        <span
          key={f.label}
          title={f.label}
          className={`text-base transition-opacity ${f.active ? 'opacity-100' : 'opacity-20'}`}
        >
          {f.icon}
        </span>
      ))}
    </div>
  )
}

export function CourseCard({
  course,
  highlighted,
  onClick,
}: {
  course: Course
  highlighted?: boolean
  onClick?: (course: Course) => void
}) {
  return (
    <div
      onClick={() => onClick?.(course)}
      className={`block rounded-xl border transition-all cursor-pointer ${
        highlighted ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Photo */}
      <div className="relative h-44 bg-gray-100 rounded-t-xl overflow-hidden">
        {course.google_place_id ? (
          <img
            src={`/api/places/photo?place_id=${course.google_place_id}&index=0`}
            alt={course.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : course.photos.length > 0 ? (
          <img
            src={course.photos[0]}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GolfIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <WishlistButton courseId={course.id} className="absolute top-2 left-2" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{course.name}</h3>
        {course.region && (
          <p className="text-sm text-gray-500">{course.region}</p>
        )}
        <StarRating course={course} size="sm" />
        <FeatureIcons course={course} />
      </div>
    </div>
  )
}

function GolfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="18" r="3" />
      <path strokeLinecap="round" d="M12 15V4" />
      <path strokeLinecap="round" d="M12 4l5 3-5 3" />
    </svg>
  )
}
