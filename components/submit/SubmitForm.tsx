'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NZ_REGIONS } from '@/lib/constants'
import { PhotoUpload } from './PhotoUpload'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const stayUnit = z.enum(['per_night', 'per_person', 'per_vehicle', 'per_person_per_night'])
const powerUnit = z.enum(['per_night', 'per_vehicle'])
// Prices are kept as strings in form state (number inputs return strings) and parsed on submit.
const priceString = z.string()
  .optional()
  .refine(s => !s || !Number.isNaN(Number(s)), { message: 'Must be a number' })

const schema = z.object({
  name: z.string().min(2, 'Course name is required'),
  address: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  overnight_stays: z.enum(['yes', 'no']),

  free_with_green_fees: z.boolean(),
  stay_no_play_allowed: z.boolean(),
  stay_no_play_price: priceString,
  stay_no_play_unit: stayUnit.or(z.literal('')).optional(),
  stay_with_play_allowed: z.boolean(),
  stay_with_play_price: priceString,
  stay_with_play_unit: stayUnit.or(z.literal('')).optional(),
  donation_accepted: z.boolean(),

  dogs: z.enum(['yes', 'no', 'unknown']),
  power: z.boolean(),
  power_additional_cost: priceString,
  power_unit: powerUnit.or(z.literal('')).optional(),
  booking: z.enum(['unknown', 'walk_in', 'ask_first', 'must_book']),
  submitted_by: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STAY_UNIT_OPTIONS: { value: 'per_night' | 'per_person' | 'per_vehicle' | 'per_person_per_night'; label: string }[] = [
  { value: 'per_night',            label: 'per night' },
  { value: 'per_person',           label: 'per person' },
  { value: 'per_vehicle',          label: 'per vehicle' },
  { value: 'per_person_per_night', label: 'per person/night' },
]

const POWER_UNIT_OPTIONS: { value: 'per_night' | 'per_vehicle'; label: string }[] = [
  { value: 'per_night',   label: 'per night' },
  { value: 'per_vehicle', label: 'per vehicle' },
]

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
      overnight_stays: 'no',
      free_with_green_fees: false,
      stay_no_play_allowed: false,
      stay_with_play_allowed: false,
      donation_accepted: false,
      dogs: 'unknown',
      power: false,
      booking: 'unknown',
    },
  })

  const overnightStays = watch('overnight_stays')
  const stayNoPlay = watch('stay_no_play_allowed')
  const stayWithPlay = watch('stay_with_play_allowed')
  const power = watch('power')

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const num = (s: string | undefined) => (s && s.trim() !== '' ? Number(s) : null)
    const unit = <T extends string>(s: T | '' | undefined) => (s && s !== '' ? s : null)
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        overnight_stays: data.overnight_stays === 'yes',
        stay_no_play_price: num(data.stay_no_play_price),
        stay_no_play_unit:  unit(data.stay_no_play_unit),
        stay_with_play_price: num(data.stay_with_play_price),
        stay_with_play_unit:  unit(data.stay_with_play_unit),
        power_additional_cost: num(data.power_additional_cost),
        power_unit:            unit(data.power_unit),
        photos,
      }),
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
          Your course has been submitted for review. We&apos;ll check it and publish it soon.
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
        <Field label="Allows Overnight Stays">
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="yes"
                {...register('overnight_stays')}
                className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="no"
                {...register('overnight_stays')}
                className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        </Field>

        {overnightStays === 'yes' && (
          <>
            <p className="text-xs text-gray-500 -mt-2">Tick every option this course offers — many allow more than one.</p>

            <CheckField label="Free with green fees" description="Stay free if you pay one or more green fees">
              <input type="checkbox" {...register('free_with_green_fees')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
            </CheckField>

            <CheckField label="Pay to stay (no play)" description="Stay without playing — paid">
              <input type="checkbox" {...register('stay_no_play_allowed')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
            </CheckField>
            {stayNoPlay && (
              <PriceUnitRow
                priceProps={register('stay_no_play_price')}
                unitProps={register('stay_no_play_unit')}
                unitOptions={STAY_UNIT_OPTIONS}
              />
            )}

            <CheckField label="Pay to stay & play" description="Stay with golf, paid (sometimes a discounted rate)">
              <input type="checkbox" {...register('stay_with_play_allowed')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
            </CheckField>
            {stayWithPlay && (
              <PriceUnitRow
                priceProps={register('stay_with_play_price')}
                unitProps={register('stay_with_play_unit')}
                unitOptions={STAY_UNIT_OPTIONS}
              />
            )}

            <CheckField label="Donation accepted" description="Donation-based, no fixed price">
              <input type="checkbox" {...register('donation_accepted')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
            </CheckField>

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <CheckField label="Powered sites available" description="Electrical hookup">
                <input type="checkbox" {...register('power')} className="h-4 w-4 rounded border-gray-300 text-green-600" />
              </CheckField>
              {power && (
                <>
                  <p className="text-xs text-gray-500 -mt-2 ml-7">Power cost is in addition to the stay cost above.</p>
                  <PriceUnitRow
                    priceProps={register('power_additional_cost')}
                    unitProps={register('power_unit')}
                    unitOptions={POWER_UNIT_OPTIONS}
                  />
                </>
              )}
            </div>
          </>
        )}

        <Field label="Dogs">
          <select
            {...register('dogs')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="unknown">Unknown</option>
            <option value="yes">Allowed</option>
            <option value="no">Not allowed</option>
          </select>
        </Field>

        <Field label="Booking">
          <select
            {...register('booking')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="unknown">Unknown</option>
            <option value="walk_in">Walk-ins welcome</option>
            <option value="ask_first">Ask first</option>
            <option value="must_book">Must book ahead</option>
          </select>
        </Field>
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

type RegisterProps = ReturnType<ReturnType<typeof useForm<FormData>>['register']>

function PriceUnitRow({
  priceProps,
  unitProps,
  unitOptions,
}: {
  priceProps: RegisterProps
  unitProps: RegisterProps
  unitOptions: { value: string; label: string }[]
}) {
  return (
    <div className="ml-7 -mt-2 flex items-center gap-2">
      <span className="text-sm text-gray-500">$</span>
      <Input
        type="number"
        step="0.5"
        min="0"
        placeholder="20"
        className="w-24 py-1"
        {...priceProps}
      />
      <select
        {...unitProps}
        className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Select unit</option>
        {unitOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
