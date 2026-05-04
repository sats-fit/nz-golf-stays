'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { Course, FilterState } from '@/lib/types'
import { CourseList } from '@/components/courses/CourseList'
import { ViewMode } from '@/components/ui/ViewToggle'
import { MapView, MapBounds } from '@/components/map/MapView'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { CourseDetailModal } from '@/components/courses/CourseDetailModal'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { MobileFiltersSheet } from '@/components/mobile/MobileFiltersSheet'
import { useFilters } from '@/hooks/useFilters'

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

const COUNTABLE_FILTER_KEYS: (keyof FilterState)[] = [
  'free_with_green_fees', 'stay_no_play', 'stay_with_play', 'donation',
  'power', 'dogs', 'booking_required',
]

export function HomePage({ courses }: { courses: Course[] }) {
  const [view, setView] = useState<ViewMode>('split')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [wishlistOnly, setWishlistOnly] = useState(false)
  const [detailCourse, setDetailCourse] = useState<Course | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { wishlisted, openAuthModal, session } = useAuth()
  const { filters } = useFilters()
  const isMobile = useMobile()

  useEffect(() => {
    if (!session) { setIsAdmin(false); return }
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(({ isAdmin }) => setIsAdmin(isAdmin))
      .catch(() => setIsAdmin(false))
  }, [session])

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
    const activeFilterCount =
      COUNTABLE_FILTER_KEYS.filter(k => !!filters[k]).length +
      (filters.region ? 1 : 0) +
      (!filters.overnight_stays ? 1 : 0) +
      (wishlistOnly ? 1 : 0)

    return (
      <>
        <Header mobileNav={{ onFiltersOpen: () => setMobileFiltersOpen(true), activeFilterCount }} />
        {detailCourse && (
          <CourseDetailModal course={detailCourse} onClose={() => setDetailCourse(null)} isAdmin={isAdmin} />
        )}
        <MobileLayout
          courses={filteredCourses}
          filteredCourses={coursesInBounds(filteredCourses, mapBounds)}
          highlightedId={highlightedId}
          onBoundsChange={handleBoundsChange}
          onCourseSelect={setDetailCourse}
        />
        <Suspense>
          <MobileFiltersSheet
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            count={filteredCourses.length}
            wishlistOnly={wishlistOnly}
            onWishlistToggle={() => setWishlistOnly(v => !v)}
          />
        </Suspense>
      </>
    )
  }

  const desktopNav = {
    view,
    onViewChange: setView,
    wishlistOnly,
    onWishlistToggle: () => setWishlistOnly(v => !v),
    courseCount: courses.length,
  }

  return (
    <>
      <Header desktopNav={desktopNav} />
      {detailCourse && (
        <CourseDetailModal course={detailCourse} onClose={() => setDetailCourse(null)} isAdmin={isAdmin} />
      )}

      {/* View area — header is ~105px tall (2 rows) */}
      {view === 'split' ? (
        <div className="flex">
          <div className="flex-1 p-4">
            <CourseList courses={visibleCourses} highlightedId={highlightedId} columns={2} onCourseClick={setDetailCourse} />
          </div>
          <div className="flex-1 sticky top-[105px] self-start bg-white p-4" style={{ height: 'calc(100vh - 105px)' }}>
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
          <CourseList courses={visibleCourses} highlightedId={highlightedId} onCourseClick={setDetailCourse} />
        </div>
      )}
    </>
  )
}
