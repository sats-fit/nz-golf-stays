'use client'

import { useState } from 'react'

export function NotesEditor({
  courseId,
  initialNotes,
  onSave,
}: {
  courseId: string
  initialNotes: string | null
  onSave?: (notes: string | null) => void
}) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const value = notes.trim() || null
    const res = await fetch('/api/admin/notes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: courseId, notes: value }),
    })
    setSaving(false)
    if (res.ok) {
      onSave?.(value)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (!value) setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-green-600 transition-colors"
      >
        {notes ? '✏️ Edit notes' : '+ Add notes'}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        placeholder="Add a note visible on the public listing..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
        <button
          onClick={() => { setNotes(initialNotes ?? ''); setOpen(false) }}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
