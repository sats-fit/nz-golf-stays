'use client'

import { Course } from '@/lib/types'
import { NotesEditor } from './NotesEditor'

export function ApprovedCourseCard({ course, onEdit }: { course: Course; onEdit: (course: Course) => void }) {
  return (
    <div className="border border-brand-border rounded-xl px-4 py-3 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-brand-navy text-sm">{course.name}</span>
            {course.region && (
              <span className="text-xs text-brand-muted">{course.region}</span>
            )}
          </div>
          {course.notes && (
            <p className="text-xs text-brand-muted mt-1 bg-amber-50 border border-amber-100 rounded px-2 py-1">
              {course.notes}
            </p>
          )}
          <div className="mt-2">
            <NotesEditor courseId={course.id} initialNotes={course.notes} />
          </div>
        </div>
        <button
          onClick={() => onEdit(course)}
          className="shrink-0 text-xs text-brand-muted hover:text-brand-navy border border-brand-border hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
