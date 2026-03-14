'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import Link from 'next/link'
import { Course } from '@/lib/types'
import { CourseBadges } from '@/components/courses/CourseBadges'

const NZ_CENTER = { lat: -41.2865, lng: 174.7762 }
const NZ_ZOOM = 6

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
  labelMap,
}: {
  courses: Course[]
  highlightedId?: string | null
  onCourseHover?: (id: string | null) => void
  onBoundsChange?: (bounds: MapBounds) => void
  /** When provided, only courses in this map get a labelled green marker; others get a grey dot */
  labelMap?: Record<string, string>
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Re-label markers whenever labelMap changes (split view panning)
  useEffect(() => {
    if (isLoading) return
    for (const [id, marker] of markersRef.current) {
      const letter = labelMap?.[id]
      if (labelMap == null) {
        // No labelMap — keep whatever label was set on creation
        return
      }
      if (letter) {
        marker.setLabel({ text: letter, color: '#ffffff', fontWeight: 'bold', fontSize: '12px' })
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#16a34a',
          fillOpacity: 1,
          strokeColor: '#15803d',
          strokeWeight: 2,
        })
      } else {
        // Course is off-screen in split view — show as a small grey dot
        marker.setLabel({ text: ' ', color: 'transparent', fontSize: '1px', fontWeight: 'normal' })
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#9ca3af',
          fillOpacity: 0.5,
          strokeColor: '#6b7280',
          strokeWeight: 1,
        })
      }
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
      courses.forEach((course, i) => {
        if (!course.lat || !course.lng) return
        if (markersRef.current.has(course.id)) return

        const letter = labelMap != null ? (labelMap[course.id] ?? null) : String.fromCharCode(65 + (i % 26))
        const labeled = letter != null

        const marker = new Marker({
          map,
          position: { lat: course.lat, lng: course.lng },
          title: course.name,
          label: labeled
            ? { text: letter!, color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }
            : { text: ' ', color: 'transparent', fontSize: '1px', fontWeight: 'normal' },
          icon: labeled
            ? { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: '#16a34a', fillOpacity: 1, strokeColor: '#15803d', strokeWeight: 2 }
            : { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#9ca3af', fillOpacity: 0.5, strokeColor: '#6b7280', strokeWeight: 1 },
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
    <div className="relative w-full h-full" onClick={() => setSelectedCourse(null)}>
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
            <Link
              href={`/courses/${selectedCourse.id}`}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg"
            >
              View details →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
