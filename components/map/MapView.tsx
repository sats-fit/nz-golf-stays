'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { Course } from '@/lib/types'
import { stayNPlayLabel } from '@/lib/utils'

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
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      .then(({ Map, InfoWindow }) => {
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
        infoWindowRef.current = new InfoWindow()
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
    const infoWindow = infoWindowRef.current!
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
          infoWindow.setContent(buildInfoWindowContent(course))
          infoWindow.open({ anchor: marker, map })
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
    </div>
  )
}

function buildInfoWindowContent(course: Course): string {
  const badges = [
    course.overnight_stays ? 'Overnight' : null,
    course.stay_n_play !== 'no' ? stayNPlayLabel(course.stay_n_play) : null,
    course.dogs === 'yes' ? 'Dogs OK' : null,
    course.power ? 'Power' : null,
  ]
    .filter(Boolean)
    .map(
      b =>
        `<span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:9999px;font-size:11px;margin-right:3px;">${b}</span>`
    )
    .join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:240px;padding:4px 0">
      <strong style="font-size:14px;color:#111;">${course.name}</strong>
      ${course.region ? `<p style="color:#6b7280;font-size:12px;margin:2px 0 0">${course.region}</p>` : ''}
      ${course.address ? `<p style="color:#9ca3af;font-size:11px;margin:2px 0 6px">${course.address}</p>` : ''}
      <div style="margin:6px 0">${badges}</div>
      <a href="/courses/${course.id}"
         style="display:inline-block;background:#16a34a;color:white;padding:4px 10px;border-radius:6px;font-size:12px;text-decoration:none;margin-top:4px">
        View details →
      </a>
    </div>
  `
}
