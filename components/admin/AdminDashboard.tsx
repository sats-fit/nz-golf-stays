'use client'

import { useState } from 'react'
import { Course } from '@/lib/types'
import { PendingCourseCard } from './PendingCourseCard'
import { ApprovedCourseCard } from './ApprovedCourseCard'

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

  const handleAction = (id: string) => {
    setPending(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 w-fit">
        <TabButton active={tab === 'pending'} onClick={() => setTab('pending')}>
          Pending {pending.length > 0 && <span className="ml-1.5 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>}
        </TabButton>
        <TabButton active={tab === 'approved'} onClick={() => setTab('approved')}>
          All Courses
        </TabButton>
      </div>

      {tab === 'pending' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Pending Submissions</h1>
            <p className="text-gray-500 mt-1">
              {pending.length === 0
                ? 'No pending submissions'
                : `${pending.length} submission${pending.length === 1 ? '' : 's'} to review`}
            </p>
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">✓</div>
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(course => (
                <PendingCourseCard key={course.id} course={course} onAction={handleAction} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'approved' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
            <p className="text-gray-500 mt-1">{approvedCourses.length} published listings</p>
          </div>

          <div className="space-y-3">
            {approvedCourses.map(course => (
              <ApprovedCourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}
