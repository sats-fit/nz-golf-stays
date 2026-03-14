'use client'

import { useAuth } from '@/components/auth/AuthProvider'

export function WishlistButton({ courseId, className }: { courseId: string; className?: string }) {
  const { wishlisted, toggleWishlist } = useAuth()
  const isSaved = wishlisted.has(courseId)

  return (
    <button
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await toggleWishlist(courseId)
      }}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur hover:bg-white transition-colors shadow-sm ${className ?? ''}`}
      aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : '#374151'} strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
