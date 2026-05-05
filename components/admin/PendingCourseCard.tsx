'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { CourseBadges } from '@/components/courses/CourseBadges'
import { NotesEditor } from './NotesEditor'

export function PendingCourseCard({
  course,
  onAction,
  onEdit,
}: {
  course: Course
  onAction: (id: string, action: 'approve' | 'reject') => void
  onEdit: (course: Course) => void
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [currentNotes, setCurrentNotes] = useState(course.notes)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)
    const res = await fetch('/api/admin/approve', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: course.id, action }),
    })
    if (res.ok) {
      onAction(course.id, action)
    }
    setLoading(null)
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{course.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {course.region && <span className="mr-2">{course.region}</span>}
            {course.address && <span className="text-gray-400">{course.address}</span>}
          </p>
          {course.phone && (
            <p className="text-xs text-gray-400 mt-1">📞 {course.phone}</p>
          )}
          {course.submitted_by && (
            <p className="text-xs text-gray-400 mt-1">Submitted by: {course.submitted_by}</p>
          )}
          <div className="mt-3">
            <CourseBadges course={course} />
          </div>

          <div className="mt-3">
            <NotesEditor courseId={course.id} initialNotes={currentNotes} onSave={setCurrentNotes} />
          </div>
        </div>

        {course.photos.length > 0 && (
          <img
            src={course.photos[0]}
            alt={course.name}
            className="w-20 h-20 object-cover rounded-lg shrink-0"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleAction('approve')}
          disabled={!!loading}
          className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading === 'approve' ? 'Approving...' : '✓ Approve'}
        </button>
        <button
          onClick={() => onEdit(course)}
          disabled={!!loading}
          className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={!!loading}
          className="flex-1 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'reject' ? 'Rejecting...' : '✕ Reject'}
        </button>
      </div>
    </div>
  )
}
