import Link from 'next/link'
import { Course } from '@/lib/types'
import { CourseBadges } from './CourseBadges'

export function CourseCard({
  course,
  marker,
  highlighted,
}: {
  course: Course
  marker?: string
  highlighted?: boolean
}) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className={`block rounded-xl border transition-all hover:shadow-md ${
        highlighted ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Photo */}
      <div className="relative h-44 bg-gray-100 rounded-t-xl overflow-hidden">
        {course.google_place_id ? (
          <img
            src={`/api/places/photo?place_id=${course.google_place_id}&index=0`}
            alt={course.name}
            className="w-full h-full object-cover"
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
        {marker && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {marker}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-0.5 truncate">{course.name}</h3>
        {course.region && (
          <p className="text-sm text-gray-500 mb-2">{course.region}</p>
        )}
        {course.address && (
          <p className="text-xs text-gray-400 mb-3 truncate">{course.address}</p>
        )}
        <CourseBadges course={course} />
      </div>
    </Link>
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
