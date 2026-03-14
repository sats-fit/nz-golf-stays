import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'NZ Golf Stays — Find Golf Courses That Welcome Motorhomes',
  description:
    'Search NZ golf courses that allow motorhome overnight stays. Filter by dogs, power, stay & play, and more.',
  openGraph: {
    title: 'NZ Golf Stays',
    description: 'Find NZ golf courses that welcome motorhome stays.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
