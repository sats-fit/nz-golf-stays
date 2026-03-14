'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { Course } from '@/lib/types'
import { CourseBadges } from '@/components/courses/CourseBadges'
import { WishlistButton } from '@/components/ui/WishlistButton'

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
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Photo */}
          <div className="relative h-40 bg-gray-100">
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
            <WishlistButton courseId={selectedCourse.id} className="absolute top-2 left-2" />
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          {/* Details */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedCourse.name}</h3>
            {selectedCourse.region && (
              <p className="text-xs text-gray-500 mb-1">{selectedCourse.region}</p>
            )}
            <div className="mb-3">
              <CourseBadges course={selectedCourse} />
            </div>
            <button
              onClick={() => {
                onCourseSelectRef.current?.(selectedCourse)
                setSelectedCourse(null)
              }}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg"
            >
              View details →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
