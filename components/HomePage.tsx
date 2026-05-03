'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { Course } from '@/lib/types'
import { CourseList } from '@/components/courses/CourseList'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle'
import { MapView, MapBounds } from '@/components/map/MapView'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { CourseDetailModal } from '@/components/courses/CourseDetailModal'
import { MobileLayout } from '@/components/mobile/MobileLayout'

function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

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

export function HomePage({ courses, isAdmin = false }: { courses: Course[]; isAdmin?: boolean }) {
  const [view, setView] = useState<ViewMode>('split')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [wishlistOnly, setWishlistOnly] = useState(false)
  const [detailCourse, setDetailCourse] = useState<Course | null>(null)
  const { wishlisted, openAuthModal, session } = useAuth()
  const isMobile = useMobile()

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  const filteredCourses = wishlistOnly
    ? courses.filter(c => wishlisted.has(c.id))
    : courses
  const visibleCourses = view === 'split' ? coursesInBounds(filteredCourses, mapBounds) : filteredCourses

  // labelMap: just used to dim out-of-bounds markers, no letters needed
  const labelMap = view === 'split'
    ? Object.fromEntries(visibleCourses.map(c => [c.id, '']))
    : undefined

  if (isMobile) {
    const mobileNav = {
      view,
      onViewChange: setView,
      wishlistOnly,
      onWishlistToggle: () => setWishlistOnly(v => !v),
    }
    return (
      <>
        <Header mobileNav={mobileNav} />
        {detailCourse && (
          <CourseDetailModal course={detailCourse} onClose={() => setDetailCourse(null)} isAdmin={isAdmin} />
        )}
        {view === 'map' ? (
          <div className="h-[calc(100dvh-105px)]">
            <MapView
              courses={filteredCourses}
              highlightedId={highlightedId}
              onCourseHover={setHighlightedId}
              onCourseSelect={setDetailCourse}
            />
          </div>
        ) : (
          <div className="p-4">
            <CourseList courses={filteredCourses} highlightedId={highlightedId} onCourseClick={setDetailCourse} />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Header />
      {detailCourse && (
        <CourseDetailModal course={detailCourse} onClose={() => setDetailCourse(null)} isAdmin={isAdmin} />
      )}

      {/* Body row — not height-constrained, so page can grow and window scrolls */}
      <div className="flex">
        <Suspense>
          <FilterSidebar />
        </Suspense>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Toolbar — sticky below header */}
          <div className="sticky top-[57px] z-10 bg-white flex items-center justify-between px-5 py-3 border-b border-gray-100">
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
            <div className="flex">
              {/* Left: naturally flowing list */}
              <div className="flex-1 p-4">
                <CourseList courses={visibleCourses} highlightedId={highlightedId} columns={2} onCourseClick={setDetailCourse} />
              </div>
              {/* Right: sticky map — floated card with padding + rounded corners */}
              <div className="flex-1 sticky top-[105px] self-start bg-white p-4" style={{height: 'calc(100vh - 105px)'}}>
                <div className="h-full rounded-2xl overflow-hidden shadow-md">
                  <MapView
                    courses={filteredCourses}
                    highlightedId={highlightedId}
                    onCourseHover={setHighlightedId}
                    onBoundsChange={handleBoundsChange}
                    onCourseSelect={setDetailCourse}
                    labelMap={labelMap}
                  />
                </div>
              </div>
            </div>
          ) : view === 'map' ? (
            <div className="h-[calc(100vh-105px)]">
              <MapView
                courses={courses}
                highlightedId={highlightedId}
                onCourseHover={setHighlightedId}
                onCourseSelect={setDetailCourse}
              />
            </div>
          ) : (
            <div className="p-5">
              <CourseList courses={courses} highlightedId={highlightedId} onCourseClick={setDetailCourse} />
            </div>
          )}
        </main>
      </div>
    </>
  )
}
