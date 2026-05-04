'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { Course } from '@/lib/types'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { StarRating } from '@/components/ui/StarRating'

const NZ_CENTER = { lat: -41.5, lng: 172.8 }
const NZ_ZOOM = 5

function flagIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
    <line x1="7" y1="3" x2="7" y2="27" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
    <polygon points="7,3 20,9 7,15" fill="${color}"/>
    <circle cx="7" cy="27" r="3.5" fill="#1f2937"/>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const FLAG_ACTIVE = flagIcon('#16a34a')
const FLAG_DIM = flagIcon('#9ca3af')
const FLAG_HIGHLIGHTED = flagIcon('#15803d')

let optionsSet = false

function ensureOptions() {
  if (!optionsSet) {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '' })
    optionsSet = true
  }
}

export type MapBounds = {
  north: number
  south: number
  east: number
  west: number
}

export function MapView({
  courses,
  highlightedId,
  onCourseHover,
  onBoundsChange,
  onCourseSelect,
  labelMap,
}: {
  courses: Course[]
  highlightedId?: string | null
  onCourseHover?: (id: string | null) => void
  onBoundsChange?: (bounds: MapBounds) => void
  onCourseSelect?: (course: Course) => void
  /** When provided, courses not in the map get dimmed markers */
  labelMap?: Record<string, string>
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const onCourseSelectRef = useRef(onCourseSelect)
  onCourseSelectRef.current = onCourseSelect
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Highlight the hovered marker
  useEffect(() => {
    if (isLoading) return
    for (const [id, marker] of markersRef.current) {
      const inView = labelMap == null || id in labelMap
      const isHighlighted = id === highlightedId
      marker.setIcon({
        url: isHighlighted ? FLAG_HIGHLIGHTED : inView ? FLAG_ACTIVE : FLAG_DIM,
        scaledSize: isHighlighted ? new google.maps.Size(26, 35) : new google.maps.Size(22, 30),
        anchor: isHighlighted ? new google.maps.Point(8, 35) : new google.maps.Point(7, 30),
      })
      if (isHighlighted) marker.setZIndex(999)
      else marker.setZIndex(undefined as unknown as number)
    }
  }, [highlightedId, isLoading, labelMap])

  // Update marker icons when visible set changes (split view panning)
  useEffect(() => {
    if (isLoading || labelMap == null) return
    for (const [id, marker] of markersRef.current) {
      const inView = id in labelMap
      marker.setLabel('')
      marker.setIcon({
        url: inView ? FLAG_ACTIVE : FLAG_DIM,
        scaledSize: new google.maps.Size(22, 30),
        anchor: new google.maps.Point(7, 30),
      })
    }
  }, [labelMap, isLoading])

  // Init map
  useEffect(() => {
    if (!mapRef.current) return

    ensureOptions()

    importLibrary('maps')
      .then(({ Map }) => {
        if (!mapRef.current) return

        const map = new Map(mapRef.current, {
          center: NZ_CENTER,
          zoom: NZ_ZOOM,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        })

        map.addListener('idle', () => {
          const b = map.getBounds()
          if (b && onBoundsChangeRef.current) {
            onBoundsChangeRef.current({
              north: b.getNorthEast().lat(),
              south: b.getSouthWest().lat(),
              east: b.getNorthEast().lng(),
              west: b.getSouthWest().lng(),
            })
          }
        })

        map.addListener('click', () => setSelectedCourse(null))

        mapInstanceRef.current = map
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        console.error('Google Maps failed to load:', err)
        setError('Map failed to load. Check your Google Maps API key.')
        setIsLoading(false)
      })
  }, [])

  // Sync markers when courses change
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return

    const map = mapInstanceRef.current
    const existingIds = new Set(markersRef.current.keys())

    // Remove stale markers
    for (const id of existingIds) {
      if (!courses.find(c => c.id === id)) {
        const marker = markersRef.current.get(id)!
        marker.setMap(null)
        markersRef.current.delete(id)
      }
    }

    // Add new markers
    importLibrary('marker').then(({ Marker }) => {
      courses.forEach((course) => {
        if (!course.lat || !course.lng) return
        if (markersRef.current.has(course.id)) return

        const inView = labelMap == null || course.id in labelMap

        const marker = new Marker({
          map,
          position: { lat: course.lat, lng: course.lng },
          title: course.name,
          icon: {
            url: inView ? FLAG_ACTIVE : FLAG_DIM,
            scaledSize: new google.maps.Size(22, 30),
            anchor: new google.maps.Point(7, 30),
          },
        })

        marker.addListener('click', () => {
          setSelectedCourse(course)
        })

        markersRef.current.set(course.id, marker)
      })
    })
  }, [courses, isLoading])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-gray-400 text-sm">Loading map...</div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />

      {selectedCourse && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-72 bg-white rounded-2xl shadow-2xl border border-brand-border overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Photo */}
          <div className="relative bg-brand-surface rounded-t-2xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
            {selectedCourse.google_place_id ? (
              <img
                src={`/api/places/photo?place_id=${selectedCourse.google_place_id}&index=0`}
                alt={selectedCourse.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : selectedCourse.photos.length > 0 ? (
              <img
                src={selectedCourse.photos[0]}
                alt={selectedCourse.name}
                className="w-full h-full object-cover"
              />
            ) : null}
            <WishlistButton courseId={selectedCourse.id} className="absolute top-2.5 left-2.5" />
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-brand-navy hover:shadow-md transition-all"
            >
              <PopupCloseIcon />
            </button>
          </div>

          {/* Details */}
          <div className="px-4 pt-3.5 pb-4">
            <h3 className="font-display font-semibold text-brand-navy truncate leading-tight" style={{ fontSize: '17px' }}>
              {selectedCourse.name}
            </h3>
            {selectedCourse.region && (
              <p className="text-sm text-brand-muted mt-0.5">{selectedCourse.region}</p>
            )}
            <StarRating course={selectedCourse} size="sm" />
            <button
              onClick={() => {
                onCourseSelectRef.current?.(selectedCourse)
                setSelectedCourse(null)
              }}
              className="mt-3.5 block w-full text-center bg-brand-green hover:bg-brand-green-dark text-white text-sm font-semibold py-2.5 rounded-full transition-colors"
            >
              View details →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Popup helpers ────────────────────────────────────────────────────────────

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

function PopupBadge({ course }: { course: Course }) {
  const label = getPriceLabel(course)
  const showPower = course.power
  const showDogs = course.dogs === 'yes'
  const showBooking = course.booking === 'ask_first' || course.booking === 'must_book'
  const hasExtras = showPower || showDogs || showBooking

  return (
    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-brand-navy px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="9" width="13" height="8" rx="1.5" /><path d="M15 12h4l2 3v2h-6" />
        <circle cx="6" cy="18" r="1.5" fill="#1D3557" stroke="none" /><circle cx="17" cy="18" r="1.5" fill="#1D3557" stroke="none" />
      </svg>
      {label && <span>{label}</span>}
      {label && hasExtras && <span className="text-brand-navy/30">·</span>}
      {showPower && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" />
          <path d="M18 8H6a3 3 0 0 0-3 3v1a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3z" />
        </svg>
      )}
      {showDogs && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="7" cy="14" r="2" />
          <path d="M14.5 17c0 2-1.5 3.5-3.5 3.5S7.5 19 7.5 17c0-1.5 1-3 2.5-4s3 2.5 4.5 4z" />
        </svg>
      )}
      {showBooking && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
    </span>
  )
}

function PopupCloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
