'use client'

import { Course } from '@/lib/types'
import { CourseCard } from './CourseCard'

export function CourseList({
  courses,
  highlightedId,
  columns,
  onCourseClick,
}: {
  courses: Course[]
  highlightedId?: string | null
  columns?: 1 | 2
  onCourseClick?: (course: Course) => void
}) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500 text-lg mb-2">No courses found</p>
        <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
      </div>
    )
  }

  return (
    <div className={
      columns === 1 ? 'flex flex-col gap-4'
      : columns === 2 ? 'grid grid-cols-2 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
    }>
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          highlighted={highlightedId === course.id}
          onClick={onCourseClick}
        />
      ))}
    </div>
  )
}
