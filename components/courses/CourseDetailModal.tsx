'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { StarRating } from '@/components/ui/StarRating'
import { StayOptionsTable } from './StayOptionsTable'
import { CourseEditForm } from '@/components/admin/CourseEditForm'

const FEATURES = [
  { icon: '🏕️', label: 'Overnight stays', active: (c: Course) => c.overnight_stays },
  { icon: '🆓', label: 'Free w/ green fees', active: (c: Course) => c.free_with_green_fees },
  { icon: '🐕', label: 'Dogs welcome', active: (c: Course) => c.dogs === 'yes' },
  { icon: '⚡', label: 'Power hookup', active: (c: Course) => c.power },
  { icon: '📋', label: 'Ask/Book ahead', active: (c: Course) => c.booking === 'ask_first' || c.booking === 'must_book' },
]

export function CourseDetailModal({
  course: initialCourse,
  onClose,
  isAdmin = false,
}: {
  course: Course
  onClose: () => void
  isAdmin?: boolean
}) {
  const [course, setCourse] = useState(initialCourse)
  const [editing, setEditing] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {editing ? (
          <CourseEditForm
            course={course}
            onSave={updated => { setCourse(updated); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
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
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setEditing(true)}
                    className="h-8 px-3 bg-white rounded-full shadow flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-green-700 hover:shadow-md transition-all"
                    title="Edit listing"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                    </svg>
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 mb-3">
                {course.region && <p className="text-sm text-gray-500">{course.region}</p>}
                {course.region && course.google_rating && <span className="text-gray-300">·</span>}
                <StarRating course={course} size="md" />
              </div>

              {/* Feature icon row */}
              <div className="flex gap-3 mb-4">
                {FEATURES.map(f => (
                  <span
                    key={f.label}
                    title={f.label}
                    className={`text-xl transition-opacity ${f.active(course) ? 'opacity-100' : 'opacity-20'}`}
                  >
                    {f.icon}
                  </span>
                ))}
              </div>

              {/* Stay options table */}
              {course.overnight_stays && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stay Options</p>
                  <StayOptionsTable course={course} />
                </div>
              )}

              <div className="space-y-2.5 text-sm">
                {course.address && (
                  <div className="flex gap-2.5">
                    <span className="shrink-0">📍</span>
                    <a
                      href={
                        course.google_place_id
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.name)}&query_place_id=${course.google_place_id}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.name + ', New Zealand')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      {course.address}
                    </a>
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
                {course.booking === 'ask_first' && (
                  <div className="flex gap-2.5 text-gray-700"><span>📋</span><span>Ask first before arriving</span></div>
                )}
                {course.booking === 'must_book' && (
                  <div className="flex gap-2.5 text-gray-700"><span>📋</span><span>Must book ahead</span></div>
                )}
                {course.notes && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{course.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
