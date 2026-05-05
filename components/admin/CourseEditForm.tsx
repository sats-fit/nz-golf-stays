'use client'

import { useState } from 'react'
import { Course, StayUnit, PowerUnit, BookingOption, DogsOption } from '@/lib/types'
import { NZ_REGIONS } from '@/lib/constants'

const STAY_UNITS: { value: StayUnit; label: string }[] = [
  { value: 'per_night', label: 'per night' },
  { value: 'per_person', label: 'per person' },
  { value: 'per_vehicle', label: 'per vehicle' },
  { value: 'per_person_per_night', label: 'per person/night' },
]
const POWER_UNITS: { value: PowerUnit; label: string }[] = [
  { value: 'per_night', label: 'per night' },
  { value: 'per_vehicle', label: 'per vehicle' },
]

type Draft = {
  name: string
  address: string
  region: string
  phone: string
  website: string
  email: string
  notes: string
  overnight_stays: boolean
  free_with_green_fees: boolean
  stay_no_play_allowed: boolean
  stay_no_play_price: string
  stay_no_play_unit: StayUnit | ''
  stay_with_play_allowed: boolean
  stay_with_play_price: string
  stay_with_play_unit: StayUnit | ''
  donation_accepted: boolean
  power: boolean
  power_additional_cost: string
  power_unit: PowerUnit | ''
  dogs: DogsOption
  booking: BookingOption
}

function toDraft(c: Course): Draft {
  return {
    name: c.name ?? '',
    address: c.address ?? '',
    region: c.region ?? '',
    phone: c.phone ?? '',
    website: c.website ?? '',
    email: c.email ?? '',
    notes: c.notes ?? '',
    overnight_stays: c.overnight_stays,
    free_with_green_fees: c.free_with_green_fees,
    stay_no_play_allowed: c.stay_no_play_allowed,
    stay_no_play_price: c.stay_no_play_price != null ? String(c.stay_no_play_price) : '',
    stay_no_play_unit: c.stay_no_play_unit ?? '',
    stay_with_play_allowed: c.stay_with_play_allowed,
    stay_with_play_price: c.stay_with_play_price != null ? String(c.stay_with_play_price) : '',
    stay_with_play_unit: c.stay_with_play_unit ?? '',
    donation_accepted: c.donation_accepted,
    power: c.power,
    power_additional_cost: c.power_additional_cost != null ? String(c.power_additional_cost) : '',
    power_unit: c.power_unit ?? '',
    dogs: c.dogs,
    booking: c.booking,
  }
}

const EMPTY_DRAFT: Draft = {
  name: '', address: '', region: '', phone: '', website: '', email: '', notes: '',
  overnight_stays: true,
  free_with_green_fees: false,
  stay_no_play_allowed: false, stay_no_play_price: '', stay_no_play_unit: '',
  stay_with_play_allowed: false, stay_with_play_price: '', stay_with_play_unit: '',
  donation_accepted: false,
  power: false, power_additional_cost: '', power_unit: '',
  dogs: 'unknown', booking: 'unknown',
}

export function CourseEditForm({
  course,
  onSave,
  onCancel,
}: {
  course?: Course
  onSave: (saved: Course) => void
  onCancel: () => void
}) {
  const isNew = !course
  const [draft, setDraft] = useState<Draft>(course ? toDraft(course) : EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const num = (s: string) => (s.trim() !== '' ? Number(s) : null)
    const unit = <T extends string>(s: T | '') => (s !== '' ? s : null)

    const payload = {
      ...(course ? { id: course.id } : {}),
      name: draft.name.trim(),
      address: draft.address.trim() || null,
      region: draft.region || null,
      phone: draft.phone.trim() || null,
      website: draft.website.trim() || null,
      email: draft.email.trim() || null,
      notes: draft.notes.trim() || null,
      overnight_stays: draft.overnight_stays,
      free_with_green_fees: draft.free_with_green_fees,
      stay_no_play_allowed: draft.stay_no_play_allowed,
      stay_no_play_price: num(draft.stay_no_play_price),
      stay_no_play_unit: unit(draft.stay_no_play_unit),
      stay_with_play_allowed: draft.stay_with_play_allowed,
      stay_with_play_price: num(draft.stay_with_play_price),
      stay_with_play_unit: unit(draft.stay_with_play_unit),
      donation_accepted: draft.donation_accepted,
      power: draft.power,
      power_additional_cost: num(draft.power_additional_cost),
      power_unit: unit(draft.power_unit),
      dogs: draft.dogs,
      booking: draft.booking,
    }

    const res = await fetch('/api/admin/course', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err.error ?? 'Save failed')
      setSaving(false)
      return
    }

    const saved: Course = await res.json()
    onSave(saved)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border shrink-0">
        <h2 className="font-bold text-brand-navy">{isNew ? 'Add Course' : 'Edit Listing'}</h2>
        <button onClick={onCancel} className="text-sm text-brand-muted hover:text-brand-muted">Cancel</button>
      </div>

      {/* Scrollable form */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">

        <Section title="Course Details">
          <Field label="Name *">
            <input className={input} value={draft.name} onChange={e => set('name', e.target.value)} placeholder="Wairakei Golf + Sanctuary" />
          </Field>
          <Field label="Address">
            <input className={input} value={draft.address} onChange={e => set('address', e.target.value)} placeholder="123 Golf Rd, Hamilton" />
            {isNew && draft.address && (
              <p className="text-xs text-brand-muted mt-1">Will be geocoded to pin on map.</p>
            )}
          </Field>
          <Field label="Region">
            <select className={input} value={draft.region} onChange={e => set('region', e.target.value)}>
              <option value="">— select —</option>
              {NZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input className={input} type="tel" value={draft.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
            <Field label="Email">
              <input className={input} type="email" value={draft.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </div>
          <Field label="Website">
            <input className={input} type="url" value={draft.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
          </Field>
        </Section>

        <Section title="Stay Options">
          <Check label="Allows overnight stays" checked={draft.overnight_stays} onChange={v => set('overnight_stays', v)} />

          {draft.overnight_stays && (
            <div className="space-y-3 pl-1">
              <Check label="Free with green fees" checked={draft.free_with_green_fees} onChange={v => set('free_with_green_fees', v)} />

              <div className="space-y-1.5">
                <Check label="Stay without playing" checked={draft.stay_no_play_allowed} onChange={v => set('stay_no_play_allowed', v)} />
                {draft.stay_no_play_allowed && (
                  <PriceUnit
                    price={draft.stay_no_play_price}
                    unit={draft.stay_no_play_unit}
                    units={STAY_UNITS}
                    onPrice={v => set('stay_no_play_price', v)}
                    onUnit={v => set('stay_no_play_unit', v as StayUnit | '')}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Check label="Stay & play" checked={draft.stay_with_play_allowed} onChange={v => set('stay_with_play_allowed', v)} />
                {draft.stay_with_play_allowed && (
                  <PriceUnit
                    price={draft.stay_with_play_price}
                    unit={draft.stay_with_play_unit}
                    units={STAY_UNITS}
                    onPrice={v => set('stay_with_play_price', v)}
                    onUnit={v => set('stay_with_play_unit', v as StayUnit | '')}
                  />
                )}
              </div>

              <Check label="Donation accepted" checked={draft.donation_accepted} onChange={v => set('donation_accepted', v)} />
            </div>
          )}
        </Section>

        <Section title="Amenities">
          <div className="space-y-1.5">
            <Check label="Powered sites available" checked={draft.power} onChange={v => set('power', v)} />
            {draft.power && (
              <div className="pl-6">
                <p className="text-xs text-brand-muted mb-1.5">Additional cost on top of stay price</p>
                <PriceUnit
                  price={draft.power_additional_cost}
                  unit={draft.power_unit}
                  units={POWER_UNITS}
                  onPrice={v => set('power_additional_cost', v)}
                  onUnit={v => set('power_unit', v as PowerUnit | '')}
                />
              </div>
            )}
          </div>

          <Field label="Dogs">
            <select className={input} value={draft.dogs} onChange={e => set('dogs', e.target.value as DogsOption)}>
              <option value="unknown">Unknown</option>
              <option value="yes">Allowed</option>
              <option value="no">Not allowed</option>
            </select>
          </Field>

          <Field label="Booking">
            <select className={input} value={draft.booking} onChange={e => set('booking', e.target.value as BookingOption)}>
              <option value="unknown">Unknown</option>
              <option value="walk_in">Walk-ins welcome</option>
              <option value="ask_first">Ask first</option>
              <option value="must_book">Must book ahead</option>
            </select>
          </Field>
        </Section>

        <Section title="Admin Notes">
          <textarea
            className={`${input} resize-none`}
            rows={3}
            value={draft.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Notes visible on the public listing..."
          />
        </Section>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-brand-border shrink-0">
        <button
          onClick={handleSave}
          disabled={saving || !draft.name.trim()}
          className="w-full py-2.5 bg-brand-green text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {saving ? (isNew ? 'Creating…' : 'Saving…') : (isNew ? 'Create Course' : 'Save Changes')}
        </button>
      </div>
    </div>
  )
}

const input = 'w-full px-3 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-white'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest border-b border-brand-border pb-1">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-muted mb-1">{label}</label>
      {children}
    </div>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-brand-border text-green-600 focus:ring-brand-green"
      />
      <span className="text-sm text-brand-navy">{label}</span>
    </label>
  )
}

function PriceUnit({
  price, unit, units, onPrice, onUnit,
}: {
  price: string
  unit: string
  units: { value: string; label: string }[]
  onPrice: (v: string) => void
  onUnit: (v: string) => void
}) {
  return (
    <div className="pl-6 flex items-center gap-2">
      <span className="text-sm text-brand-muted">$</span>
      <input
        type="number"
        step="0.5"
        min="0"
        placeholder="0"
        value={price}
        onChange={e => onPrice(e.target.value)}
        className="w-24 px-2 py-1.5 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
      <select
        value={unit}
        onChange={e => onUnit(e.target.value)}
        className="px-2 py-1.5 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
      >
        <option value="">— unit —</option>
        {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
    </div>
  )
}
