'use client'

import { Course } from '@/lib/types'
import { NotesEditor } from './NotesEditor'

export function ApprovedCourseCard({ course }: { course: Course }) {
  return (
    <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm">{course.name}</span>
            {course.region && (
              <span className="text-xs text-gray-400">{course.region}</span>
            )}
          </div>
          {course.notes && (
            <p className="text-xs text-gray-500 mt-1 bg-amber-50 border border-amber-100 rounded px-2 py-1">
              {course.notes}
            </p>
          )}
          <div className="mt-2">
            <NotesEditor courseId={course.id} initialNotes={course.notes} />
          </div>
        </div>
      </div>
    </div>
  )
}
