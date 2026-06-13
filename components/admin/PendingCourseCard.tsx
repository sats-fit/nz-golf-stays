'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { CourseBadges } from '@/components/courses/CourseBadges'
import { NotesEditor } from './NotesEditor'

export function PendingCourseCard({
  course,
  suggestedForName,
  onAction,
  onEdit,
}: {
  course: Course
  suggestedForName?: string
  onAction: (id: string, action: 'approve' | 'reject') => void
  onEdit: (course: Course) => void
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [currentNotes, setCurrentNotes] = useState(course.notes)

  const isSuggestion = !!course.suggestion_for_course_id

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
    <div className={`border rounded-xl p-5 bg-white ${isSuggestion ? 'border-amber-200' : 'border-brand-border'}`}>
      {/* Suggestion banner */}
      {isSuggestion && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-amber-100">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Listing Update Suggestion
          </span>
          {suggestedForName && (
            <span className="text-xs text-brand-muted truncate">for <span className="font-medium text-brand-navy">{suggestedForName}</span></span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-brand-navy">{course.name}</h3>
          <p className="text-sm text-brand-muted mt-0.5">
            {course.region && <span className="mr-2">{course.region}</span>}
            {course.address && <span className="text-brand-muted">{course.address}</span>}
          </p>
          {course.phone && (
            <p className="text-xs text-brand-muted mt-1">📞 {course.phone}</p>
          )}
          {course.submitted_by && (
            <p className="text-xs text-brand-muted mt-1">
              {isSuggestion ? 'From: ' : 'Submitted by: '}
              <SubmittedBy text={course.submitted_by} />
            </p>
          )}
          <div className="mt-3">
            <CourseBadges course={course} />
          </div>

          {/* For suggestions: show user message read-only. For new submissions: show editable admin notes */}
          <div className="mt-3">
            {isSuggestion ? (
              currentNotes && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Message from suggester</p>
                  <p className="text-sm text-brand-navy leading-relaxed">{currentNotes}</p>
                </div>
              )
            ) : (
              <NotesEditor courseId={course.id} initialNotes={currentNotes} onSave={setCurrentNotes} />
            )}
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
      <div className="flex gap-2 mt-4 pt-4 border-t border-brand-border">
        <button
          onClick={() => handleAction('approve')}
          disabled={!!loading}
          className="flex-1 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {loading === 'approve' ? (isSuggestion ? 'Applying…' : 'Approving…') : (isSuggestion ? '✓ Apply changes' : '✓ Approve')}
        </button>
        {!isSuggestion && (
          <button
            onClick={() => onEdit(course)}
            disabled={!!loading}
            className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg border border-brand-border hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => handleAction('reject')}
          disabled={!!loading}
          className="flex-1 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'reject' ? 'Dismissing…' : '✕ Dismiss'}
        </button>
      </div>
    </div>
  )
}

// Renders submitter text, turning any email it contains into a mailto link.
function SubmittedBy({ text }: { text: string }) {
  const match = text.match(/[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/)
  if (!match) return <>{text}</>
  const email = match[0]
  const before = text.slice(0, match.index).replace(/[<>]/g, '')
  const after = text.slice(match.index! + email.length).replace(/[<>]/g, '')
  return (
    <>
      {before}
      <a href={`mailto:${email}`} className="text-brand-green hover:underline">
        {email}
      </a>
      {after}
    </>
  )
}
