'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { PendingCourseCard } from './PendingCourseCard'

export function AdminDashboard({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses)

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pending Submissions</h1>
        <p className="text-gray-500 mt-1">
          {courses.length === 0
            ? 'No pending submissions'
            : `${courses.length} submission${courses.length === 1 ? '' : 's'} to review`}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">✓</div>
          <p>All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <PendingCourseCard
              key={course.id}
              course={course}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
