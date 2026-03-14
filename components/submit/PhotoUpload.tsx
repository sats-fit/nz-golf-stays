'use client'

import { useState, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function PhotoUpload({
  photos,
  onChange,
}: {
  photos: string[]
  onChange: (urls: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    setError(null)
    setUploading(true)

    const supabase = createSupabaseBrowserClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size is 5MB')
        continue
      }

      const path = `submissions/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('course-photos')
        .upload(path, file)

      if (uploadError) {
        setError(uploadError.message)
        continue
      }

      const { data } = supabase.storage.from('course-photos').getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    onChange([...photos, ...newUrls])
    setUploading(false)
  }

  const removePhoto = (url: string) => {
    onChange(photos.filter(p => p !== url))
  }

  return (
    <div className="space-y-3">
      {/* Uploaded photos preview */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map(url => (
            <div key={url} className="relative">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
