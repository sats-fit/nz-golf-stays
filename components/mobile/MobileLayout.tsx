'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Course } from '@/lib/types'
import { MapView, MapBounds } from '@/components/map/MapView'
import { CourseList } from '@/components/courses/CourseList'

// Snap positions (translateY values from top of viewport)
const HANDLE_HEIGHT = 40   // drag handle + toolbar
const HEADER_HEIGHT = 57   // sticky header above this component

function getSnapPoints(vh: number) {
  return {
    peek: vh - 130,                  // ~1 card peeking
    half: Math.round(vh * 0.45),     // 50/50 split
    full: HEADER_HEIGHT + 8,         // nearly full screen
  }
}

function snapNearest(snaps: ReturnType<typeof getSnapPoints>, y: number): keyof ReturnType<typeof getSnapPoints> {
  const dists = (Object.keys(snaps) as (keyof typeof snaps)[]).map(k => ({
    key: k,
    dist: Math.abs(snaps[k] - y),
  }))
  return dists.reduce((a, b) => (a.dist <= b.dist ? a : b)).key
}

export function MobileLayout({
  courses,
  filteredCourses,
  highlightedId,
  onBoundsChange,
  onCourseSelect,
  labelMap,
}: {
  courses: Course[]
  filteredCourses: Course[]
  highlightedId: string | null
  onBoundsChange: (b: MapBounds) => void
  onCourseSelect: (c: Course) => void
  labelMap?: Record<string, string>
}) {
  const [vh, setVh] = useState(0)
  const snaps = getSnapPoints(vh)

  const [translateY, setTranslateY] = useState<number | null>(null)  // null until vh known
  const [snapKey, setSnapKey] = useState<'peek' | 'half' | 'full'>('peek')
  const [transitioning, setTransitioning] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{
    startY: number
    startTranslate: number
    dragging: boolean
    listScrolledAtStart: boolean
  } | null>(null)

  // Init vh after mount
  useEffect(() => {
    const update = () => {
      const h = window.innerHeight
      setVh(h)
      setTranslateY(prev => {
        if (prev === null) return h - 130   // initial peek
        // re-snap to same key with new dimensions
        return getSnapPoints(h)[snapKey]
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const snapTo = useCallback((key: 'peek' | 'half' | 'full') => {
    const target = getSnapPoints(window.innerHeight)[key]
    setTranslateY(target)
    setSnapKey(key)
    setTransitioning(true)
    setTimeout(() => setTransitioning(false), 320)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const listScrollTop = listRef.current?.scrollTop ?? 0
    dragState.current = {
      startY: touch.clientY,
      startTranslate: translateY ?? snaps.peek,
      dragging: true,
      listScrolledAtStart: listScrollTop > 0,
    }
  }, [translateY, snaps.peek])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragState.current?.dragging) return
    const { startY, startTranslate, listScrolledAtStart } = dragState.current

    const touch = e.touches[0]
    const delta = touch.clientY - startY

    // If list was scrolled when drag started, let list scroll
    if (listScrolledAtStart && snapKey === 'full') return

    // If sheet is full and trying to scroll up (delta < 0), let list handle it
    if (snapKey === 'full' && delta < 0) return

    e.preventDefault()
    const newY = Math.max(HEADER_HEIGHT + 8, Math.min(window.innerHeight - 80, startTranslate + delta))
    setTranslateY(newY)
    setTransitioning(false)
  }, [snapKey])

  const handleTouchEnd = useCallback(() => {
    if (!dragState.current?.dragging) return
    dragState.current.dragging = false

    const current = translateY ?? snaps.peek
    const key = snapNearest(getSnapPoints(window.innerHeight), current)
    snapTo(key)
  }, [translateY, snaps.peek, snapTo])

  // When list is at top and user scrolls down → collapse sheet
  const handleListScroll = useCallback(() => {
    if (snapKey !== 'full') return
    if ((listRef.current?.scrollTop ?? 0) === 0) {
      // User pulled to top — allow next touch drag to collapse
    }
  }, [snapKey])

  const visibleCourses = filteredCourses  // bounds filtering handled by parent if needed

  const sheetHeight = vh > 0 && translateY !== null ? vh - translateY : 0
  const listHeight = Math.max(0, sheetHeight - HANDLE_HEIGHT - 52)  // subtract handle + toolbar

  if (translateY === null) return null

  return (
    <div className="fixed inset-0" style={{ top: HEADER_HEIGHT }}>
      {/* Map fills entire background */}
      <div className="absolute inset-0">
        <MapView
          courses={courses}
          highlightedId={highlightedId}
          onCourseHover={() => {}}
          onBoundsChange={onBoundsChange}
          onCourseSelect={onCourseSelect}
          labelMap={labelMap}
        />
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.08)] will-change-transform"
        style={{
          transform: `translateY(${translateY - HEADER_HEIGHT}px)`,
          transition: transitioning ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          height: `calc(100% + ${HEADER_HEIGHT}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 cursor-grab touch-none select-none">
          <div className="w-10 h-[5px] bg-gray-300 rounded-full" />
        </div>

        {/* Toolbar — count centered like Airbnb */}
        <div className="px-4 py-2.5 flex items-center justify-center">
          <p className="text-sm text-brand-navy">
            <span className="font-semibold">{visibleCourses.length}</span>{' '}
            {visibleCourses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>

        {/* Scrollable course list */}
        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain"
          style={{ height: listHeight }}
          onScroll={handleListScroll}
        >
          <div className="p-4 pb-24">
            <CourseList
              courses={visibleCourses}
              highlightedId={highlightedId}
              columns={1}
              onCourseClick={onCourseSelect}
            />
          </div>
        </div>
      </div>

      {/* Floating "Map" pill — collapses sheet back to peek when expanded */}
      {snapKey !== 'peek' && (
        <button
          onClick={() => snapTo('peek')}
          className="fixed left-1/2 -translate-x-1/2 bottom-5 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-brand-navy text-white text-sm font-semibold shadow-lg active:scale-95 transition-transform"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <MapPillIcon />
          Map
        </button>
      )}
    </div>
  )
}

function MapPillIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}
