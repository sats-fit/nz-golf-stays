'use client'

import { useState, useCallback, Suspense } from 'react'
import { Course } from '@/lib/types'
import { CourseList } from '@/components/courses/CourseList'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle'
import { MapView, MapBounds } from '@/components/map/MapView'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/components/auth/AuthProvider'

function coursesInBounds(courses: Course[], bounds: MapBounds | null): Course[] {
  if (!bounds) return courses
  return courses.filter(c => {
    if (c.lat == null || c.lng == null) return false
    if (c.lat < bounds.south || c.lat > bounds.north) return false
    // Handle antimeridian crossing (east < west when map wraps past ±180)
    if (bounds.east < bounds.west) {
      return c.lng >= bounds.west || c.lng <= bounds.east
    }
    return c.lng >= bounds.west && c.lng <= bounds.east
  })
}

export function HomePage({ courses }: { courses: Course[] }) {
  const [view, setView] = useState<ViewMode>('split')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [wishlistOnly, setWishlistOnly] = useState(false)
  const { wishlisted, openAuthModal, session } = useAuth()

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  const filteredCourses = wishlistOnly
    ? courses.filter(c => wishlisted.has(c.id))
    : courses
  const visibleCourses = view === 'split' ? coursesInBounds(filteredCourses, mapBounds) : filteredCourses

  // Map from course ID → letter label, shared between list and map markers
  const labelMap = view === 'split'
    ? Object.fromEntries(visibleCourses.map((c, i) => [c.id, String.fromCharCode(65 + i)]))
    : undefined

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <Suspense>
          <FilterSidebar />
        </Suspense>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{visibleCourses.length}</span>{' '}
              {visibleCourses.length === 1 ? 'course' : 'courses'}{view === 'split' ? ' in view' : ' found'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!session) { openAuthModal(); return }
                  setWishlistOnly(v => !v)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  wishlistOnly
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
                title="Show wishlist only"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlistOnly ? '#ef4444' : 'none'} stroke={wishlistOnly ? '#ef4444' : 'currentColor'} strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Saved
              </button>
              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          {/* View area */}
          {view === 'split' ? (
            <div className="flex-1 flex min-h-0">
              {/* Left: scrollable list — 50% width */}
              <div className="flex-1 overflow-y-auto border-r border-gray-100 p-4">
                <CourseList courses={visibleCourses} highlightedId={highlightedId} columns={2} labelMap={labelMap} />
              </div>
              {/* Right: map — 50% width */}
              <div className="flex-1 min-w-0">
                <MapView
                  courses={filteredCourses}
                  highlightedId={highlightedId}
                  onCourseHover={setHighlightedId}
                  onBoundsChange={handleBoundsChange}
                  labelMap={labelMap}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {view === 'map' ? (
                <MapView
                  courses={courses}
                  highlightedId={highlightedId}
                  onCourseHover={setHighlightedId}
                />
              ) : (
                <div className="p-5">
                  <CourseList courses={courses} highlightedId={highlightedId} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
