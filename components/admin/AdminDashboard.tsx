'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { PendingCourseCard } from './PendingCourseCard'
import { ApprovedCourseCard } from './ApprovedCourseCard'
import { CourseEditForm } from './CourseEditForm'

type Tab = 'pending' | 'approved'

export function AdminDashboard({
  pendingCourses,
  approvedCourses,
}: {
  pendingCourses: Course[]
  approvedCourses: Course[]
}) {
  const [tab, setTab] = useState<Tab>('pending')
  const [pending, setPending] = useState(pendingCourses)
  const [approved, setApproved] = useState(approvedCourses)
  const [editTarget, setEditTarget] = useState<Course | 'new' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const q = searchQuery.toLowerCase()
  const filteredPending = q ? pending.filter(c => c.name.toLowerCase().includes(q) || c.region?.toLowerCase().includes(q)) : pending
  const filteredApproved = q ? approved.filter(c => c.name.toLowerCase().includes(q) || c.region?.toLowerCase().includes(q)) : approved

  const handlePendingAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      const course = pending.find(c => c.id === id)
      if (course) {
        const live = { ...course, approved: true }
        setApproved(prev => [...prev, live].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    setPending(prev => prev.filter(c => c.id !== id))
  }

  const handleSaved = (saved: Course) => {
    if (saved.approved) {
      setApproved(prev => {
        const idx = prev.findIndex(c => c.id === saved.id)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = saved; return next
        }
        return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name))
      })
    } else {
      setPending(prev => {
        const idx = prev.findIndex(c => c.id === saved.id)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = saved; return next
        }
        return prev
      })
    }
    setEditTarget(null)
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search by course name or region..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-brand-border bg-white text-brand-navy placeholder:text-brand-muted focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs + Add button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1 bg-brand-surface rounded-xl p-1 w-fit border border-brand-border">
            <TabButton active={tab === 'pending'} onClick={() => setTab('pending')}>
              Pending {pending.length > 0 && <span className="ml-1.5 bg-brand-green text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>}
            </TabButton>
            <TabButton active={tab === 'approved'} onClick={() => setTab('approved')}>
              All Courses
            </TabButton>
          </div>
          <button
            onClick={() => setEditTarget('new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="text-lg leading-none">+</span> Add Course
          </button>
        </div>

        {tab === 'pending' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-brand-navy">Pending Submissions</h1>
              <p className="text-brand-muted mt-1">
                {filteredPending.length === 0 && !q
                  ? 'No pending submissions'
                  : `${filteredPending.length} submission${filteredPending.length === 1 ? '' : 's'}${q ? ' matching' : ' to review'}`}
              </p>
            </div>

            {filteredPending.length === 0 ? (
              <div className="text-center py-16 text-brand-muted">
                <div className="text-4xl mb-3">{q ? '🔍' : '✓'}</div>
                <p>{q ? 'No matching submissions' : 'All caught up!'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPending.map(course => (
                  <PendingCourseCard
                    key={course.id}
                    course={course}
                    onAction={handlePendingAction}
                    onEdit={setEditTarget}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'approved' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-brand-navy">All Courses</h1>
              <p className="text-brand-muted mt-1">
                {q ? `${filteredApproved.length} of ${approved.length} matching` : `${approved.length} published listings`}
              </p>
            </div>

            {filteredApproved.length === 0 ? (
              <div className="text-center py-16 text-brand-muted">
                <div className="text-4xl mb-3">🔍</div>
                <p>No courses match your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApproved.map(course => (
                  <ApprovedCourseCard
                    key={course.id}
                    course={course}
                    onEdit={setEditTarget}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-over panel */}
      {editTarget !== null && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setEditTarget(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <CourseEditForm
              course={editTarget === 'new' ? undefined : editTarget}
              onSave={handleSaved}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        </>
      )}
    </>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
        active ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-navy'
      }`}
    >
      {children}
    </button>
  )
}
