'use client'

import { useState, useCallback, Suspense } from 'react'
import { Course } from '@/lib/types'
import { CourseList } from '@/components/courses/CourseList'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle'
import { MapView, MapBounds } from '@/components/map/MapView'
import { Header } from '@/components/layout/Header'

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

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  const visibleCourses = view === 'split' ? coursesInBounds(courses, mapBounds) : courses

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
            <ViewToggle view={view} onChange={setView} />
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
                  courses={courses}
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
