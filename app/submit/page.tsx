import Link from 'next/link'
import { SubmitForm } from '@/components/submit/SubmitForm'

export const metadata = {
  title: 'Add a Course — NZ Golf Stays',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-green-600 font-semibold text-sm">NZ Golf Stays</span>
        </div>
      </header>
      <SubmitForm />
    </div>
  )
}
