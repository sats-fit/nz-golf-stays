'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { StarRating } from '@/components/ui/StarRating'
import { StayOptionsTable } from './StayOptionsTable'
import { CourseEditForm } from '@/components/admin/CourseEditForm'

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

  const amenityBadges = [
    course.overnight_stays      && { icon: <BadgeVanIcon />,   label: 'Overnight stays' },
    course.free_with_green_fees && { icon: <BadgeCheckIcon />, label: 'Free w/ green fees' },
    course.power                && { icon: <BadgePlugIcon />,  label: 'Powered' },
    course.dogs === 'yes'       && { icon: <BadgePawIcon />,   label: 'Dogs OK' },
    course.booking === 'ask_first'  && { icon: <BadgeInfoIcon />, label: 'Ask first' },
    course.booking === 'must_book'  && { icon: <BadgeInfoIcon />, label: 'Must book' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[]

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
            <div className="relative bg-brand-surface shrink-0 rounded-t-2xl overflow-hidden" style={{ height: 220 }}>
              {course.google_place_id ? (
                <img
                  src={`/api/places/photo?place_id=${course.google_place_id}&index=0`}
                  alt={course.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : course.photos.length > 0 ? (
                <img src={course.photos[0]} alt={course.name} className="w-full h-full object-cover" />
              ) : null}
              <WishlistButton courseId={course.id} className="absolute top-3 left-3" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setEditing(true)}
                    className="h-8 px-3 bg-white/95 backdrop-blur-sm rounded-full shadow flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:shadow-md transition-all"
                  >
                    <EditIcon /> Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-brand-navy hover:shadow-md transition-all"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-5 pb-6">
              {/* Name */}
              <h2 className="font-display font-semibold text-brand-navy leading-tight" style={{ fontSize: 22 }}>
                {course.name}
              </h2>

              {/* Region · rating */}
              <div className="flex items-center gap-2 mt-1.5">
                {course.region && (
                  <span className="text-sm text-brand-muted">{course.region}</span>
                )}
                {course.region && course.google_rating && (
                  <span className="text-brand-border">·</span>
                )}
                <StarRating course={course} size="md" />
              </div>

              {/* Amenity badge pills */}
              {amenityBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {amenityBadges.map(b => (
                    <span
                      key={b.label}
                      className="inline-flex items-center gap-1.5 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full text-xs font-medium text-brand-navy"
                    >
                      {b.icon}
                      {b.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Stay options */}
              {course.overnight_stays && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                    Stay Options
                  </p>
                  <StayOptionsTable course={course} />
                </div>
              )}

              {/* Contact details */}
              <div className="mt-5 space-y-3 text-sm">
                {course.address && (
                  <div className="flex items-start gap-3 text-brand-green">
                    <PinIcon className="shrink-0 mt-0.5" />
                    <a
                      href={
                        course.google_place_id
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.name)}&query_place_id=${course.google_place_id}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.name + ', New Zealand')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline leading-snug"
                    >
                      {course.address}
                    </a>
                  </div>
                )}
                {course.phone && (
                  <div className="flex items-center gap-3 text-brand-green">
                    <PhoneIcon className="shrink-0" />
                    <a href={`tel:${course.phone}`} className="hover:underline">
                      {course.phone}
                    </a>
                  </div>
                )}
                {course.website && (
                  <div className="flex items-center gap-3 text-brand-green">
                    <GlobeIcon className="shrink-0" />
                    <a
                      href={course.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {course.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              {course.notes && (
                <div className="mt-4 bg-brand-surface rounded-xl p-4">
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Notes</p>
                  <p className="text-brand-navy text-sm leading-relaxed">{course.notes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Badge icons (12px, for amenity pills) ───────────────────────────────────

function BadgeVanIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="13" height="8" rx="1.5" />
      <path d="M15 12h4l2 3v2h-6" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BadgeCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17 4 12" />
    </svg>
  )
}

function BadgePlugIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8H6a3 3 0 0 0-3 3v1a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3z" />
    </svg>
  )
}

function BadgePawIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="7" cy="14" r="2" />
      <path d="M14.5 17c0 2-1.5 3.5-3.5 3.5S7.5 19 7.5 17c0-1.5 1-3 2.5-4s3 2.5 4.5 4z" />
    </svg>
  )
}

function BadgeInfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

// ─── Contact icons (15px, colored) ───────────────────────────────────────────

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.4 2 2 0 0 1 3.55 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// ─── UI icons ─────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
