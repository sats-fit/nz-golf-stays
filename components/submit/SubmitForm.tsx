'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NZ_REGIONS } from '@/lib/constants'
import { PhotoUpload } from './PhotoUpload'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Course name is required'),
  address: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  overnight_stays: z.boolean(),
  stay_n_play: z.enum(['yes', 'no', 'free_with_gf']),
  stay_no_play: z.boolean(),
  stay_no_play_price: z.string().optional(),
  dogs: z.enum(['yes', 'no', 'unknown']),
  power: z.boolean(),
  ask_first: z.boolean(),
  submitted_by: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function SubmitForm() {
  const [photos, setPhotos] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      overnight_stays: false,
      stay_n_play: 'no',
      stay_no_play: false,
      dogs: 'unknown',
      power: false,
      ask_first: false,
    },
  })

  const stayNoPlay = watch('stay_no_play')

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, photos }),
    })

    if (!res.ok) {
      const err = await res.json()
      setServerError(err.error?.formErrors?.[0] ?? 'Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">⛳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks for your submission!</h2>
        <p className="text-gray-500">
          Your course has been submitted for review. We'll check it and publish it soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add a Golf Course</h1>
        <p className="text-gray-500 text-sm">
          Know a course that welcomes motorhome stays? Share it with the community.
        </p>
      </div>

      {/* Basic info */}
      <Section title="Course Details">
        <Field label="Course Name *" error={errors.name?.message}>
          <Input {...register('name')} placeholder="e.g. Waiuku Golf Club" />
        </Field>
        <Field label="Address" error={errors.address?.message}>
          <Input {...register('address')} placeholder="e.g. 1 Golf Road, Waiuku 2123" />
        </Field>
        <Field label="Region">
          <select
            {...register('region')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select region</option>
            {NZ_REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="09 123 4567" type="tel" />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <Input {...register('website')} placeholder="https://..." type="url" />
          </Field>
        </div>
      </Section>

      {/* Stay options */}
      <Section title="Stay Options">
        <CheckField label="Allows Overnight Stays" description="Motorhomes can stay overnight">
          <input type="checkbox" {...register('overnight_stays')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
        </CheckField>

        <Field label="Stay & Play">
          <select
            {...register('stay_n_play')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="free_with_gf">Free with Green Fees</option>
          </select>
        </Field>

        <CheckField label="Stay No Play" description="Can stay without playing golf">
          <input type="checkbox" {...register('stay_no_play')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
        </CheckField>

        {stayNoPlay && (
          <Field label="Stay No Play Price">
            <Input {...register('stay_no_play_price')} placeholder="e.g. $20/night" />
          </Field>
        )}

        <Field label="Dogs">
          <select
            {...register('dogs')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="unknown">Unknown</option>
            <option value="yes">Yes — dogs allowed</option>
            <option value="no">No — dogs not allowed</option>
          </select>
        </Field>

        <CheckField label="Power Available" description="Electrical hookup available">
          <input type="checkbox" {...register('power')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
        </CheckField>

        <CheckField label="Ask First" description="Need to call ahead to arrange">
          <input type="checkbox" {...register('ask_first')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
        </CheckField>
      </Section>

      {/* Photos */}
      <Section title="Photos (optional)">
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </Section>

      {/* Notes */}
      <Section title="Additional Notes (optional)">
        <textarea
          {...register('notes')}
          rows={4}
          placeholder="Any other useful info about staying at this course..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </Section>

      {/* Your name */}
      <Field label="Your Name (optional)">
        <Input {...register('submitted_by')} placeholder="So we can credit you" />
      </Field>

      {serverError && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full py-3">
        {isSubmitting ? 'Submitting...' : 'Submit Course'}
      </Button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function CheckField({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      {children}
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  )
}
