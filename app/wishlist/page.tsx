'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Course } from '@/lib/types'
import { CourseCard } from '@/components/courses/CourseCard'
import { Header } from '@/components/layout/Header'

export default function WishlistPage() {
  const { session, wishlisted, openAuthModal } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) { setLoading(false); return }
    if (wishlisted.size === 0) { setCourses([]); setLoading(false); return }

    const supabase = createSupabaseBrowserClient()
    supabase
      .from('courses')
      .select('*')
      .in('id', Array.from(wishlisted))
      .then(({ data }: { data: Course[] | null }) => {
        setCourses(data ?? [])
        setLoading(false)
      })
  }, [session, wishlisted])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

        {!session ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Sign in to view your saved courses</p>
            <button
              onClick={openAuthModal}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Sign in
            </button>
          </div>
        ) : loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No saved courses yet</p>
            <Link href="/" className="text-green-600 font-medium hover:underline">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
