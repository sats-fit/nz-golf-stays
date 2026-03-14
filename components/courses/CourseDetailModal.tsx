'use client'

import { Course } from '@/lib/types'
import { CourseBadges } from './CourseBadges'
import { WishlistButton } from '@/components/ui/WishlistButton'

export function CourseDetailModal({
  course,
  onClose,
}: {
  course: Course
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative h-52 bg-gray-100 shrink-0">
          {course.google_place_id ? (
            <img
              src={`/api/places/photo?place_id=${course.google_place_id}&index=0`}
              alt={course.name}
              className="w-full h-full object-cover rounded-t-2xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : course.photos.length > 0 ? (
            <img src={course.photos[0]} alt={course.name} className="w-full h-full object-cover rounded-t-2xl" />
          ) : null}
          <WishlistButton courseId={course.id} className="absolute top-3 left-3" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
          {course.region && <p className="text-sm text-gray-500 mt-0.5 mb-3">{course.region}</p>}

          <div className="mb-4">
            <CourseBadges course={course} />
          </div>

          <div className="space-y-2.5 text-sm">
            {course.address && (
              <div className="flex gap-2.5 text-gray-700">
                <span className="shrink-0">📍</span>
                <span>{course.address}</span>
              </div>
            )}
            {course.phone && (
              <div className="flex gap-2.5">
                <span className="shrink-0">📞</span>
                <a href={`tel:${course.phone}`} className="text-green-600 hover:underline">{course.phone}</a>
              </div>
            )}
            {course.website && (
              <div className="flex gap-2.5">
                <span className="shrink-0">🌐</span>
                <a href={course.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline truncate">
                  {course.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {course.overnight_stays && (
              <div className="flex gap-2.5 text-gray-700"><span>🏕️</span><span>Overnight motorhome stays allowed</span></div>
            )}
            {course.stay_n_play === 'yes' && (
              <div className="flex gap-2.5 text-gray-700"><span>⛳</span><span>Stay &amp; Play available</span></div>
            )}
            {course.stay_n_play === 'free_with_gf' && (
              <div className="flex gap-2.5 text-gray-700"><span>⛳</span><span>Free stay with green fees</span></div>
            )}
            {course.stay_no_play && (
              <div className="flex gap-2.5 text-gray-700">
                <span>🛖</span>
                <span>Stay without playing{course.stay_no_play_price ? ` · ${course.stay_no_play_price}` : ''}</span>
              </div>
            )}
            {course.dogs === 'yes' && (
              <div className="flex gap-2.5 text-gray-700"><span>🐕</span><span>Dogs welcome</span></div>
            )}
            {course.power && (
              <div className="flex gap-2.5 text-gray-700"><span>⚡</span><span>Power hookup available</span></div>
            )}
            {course.ask_first && (
              <div className="flex gap-2.5 text-gray-700"><span>📋</span><span>Please call ahead to arrange stay</span></div>
            )}
            {course.notes && (
              <div className="mt-3 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-gray-700 text-sm leading-relaxed">{course.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
