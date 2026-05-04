'use client'

import { Course } from '@/lib/types'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { StarRating } from '@/components/ui/StarRating'

function getPriceLabel(course: Course): string | null {
  if (course.free_with_green_fees) return 'Free w/ fees'
  const prices = [
    course.stay_no_play_allowed && course.stay_no_play_price,
    course.stay_with_play_allowed && course.stay_with_play_price,
  ].filter((p): p is number => typeof p === 'number' && p > 0)
  if (prices.length > 0) return `$${Math.min(...prices)}`
  if (course.overnight_stays) return 'Free'
  return null
}

function TopRightBadge({ course }: { course: Course }) {
  const label = getPriceLabel(course)
  const showPower = course.power
  const showDogs = course.dogs === 'yes'
  const showBooking = course.booking === 'ask_first' || course.booking === 'must_book'
  const hasExtras = showPower || showDogs || showBooking

  return (
    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-brand-navy px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
      <VanIconSm />
      {label && <span>{label}</span>}
      {label && hasExtras && <span className="text-brand-navy/30">·</span>}
      {showPower && <PlugIconSm />}
      {showDogs && <PawIconSm />}
      {showBooking && <InfoIconSm />}
    </span>
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
      className={`block rounded-xl border transition-all cursor-pointer bg-white ${
        highlighted
          ? 'border-brand-green shadow-md'
          : 'border-brand-border hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Photo */}
      <div className="relative bg-brand-surface rounded-t-xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
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
            <GolfIcon />
          </div>
        )}
        <WishlistButton courseId={course.id} className="absolute top-2.5 left-2.5" />
        <TopRightBadge course={course} />
      </div>

      {/* Content */}
      <div className="px-4 pt-3.5 pb-4">
        <h3 className="font-display font-semibold text-brand-navy truncate leading-tight" style={{ fontSize: '17px' }}>
          {course.name}
        </h3>
        {course.region && (
          <p className="text-sm text-brand-muted mt-0.5">{course.region}</p>
        )}
        <StarRating course={course} size="sm" />
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function VanIconSm() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="13" height="8" rx="1.5" />
      <path d="M15 12h4l2 3v2h-6" />
      <circle cx="6" cy="18" r="1.5" fill="#1D3557" stroke="none" />
      <circle cx="17" cy="18" r="1.5" fill="#1D3557" stroke="none" />
    </svg>
  )
}

function PlugIconSm() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8H6a3 3 0 0 0-3 3v1a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3z" />
    </svg>
  )
}

function PawIconSm() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="7" cy="14" r="2" />
      <path d="M14.5 17c0 2-1.5 3.5-3.5 3.5S7.5 19 7.5 17c0-1.5 1-3 2.5-4s3 2.5 4.5 4z" />
    </svg>
  )
}

function InfoIconSm() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function GolfIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
      <circle cx="12" cy="18" r="3" />
      <path strokeLinecap="round" d="M12 15V4" />
      <path strokeLinecap="round" d="M12 4l5 3-5 3" />
    </svg>
  )
}
