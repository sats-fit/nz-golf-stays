import { Course } from '@/lib/types'
import { formatStayPrice } from '@/lib/utils'

export function StayOptionsTable({ course }: { course: Course }) {
  const rows: { label: string; value: React.ReactNode; hint?: string }[] = []

  if (course.free_with_green_fees) {
    rows.push({
      label: 'Free with green fees',
      value: <Check />,
      hint: 'Pay one or more green fees to stay overnight',
    })
  }
  if (course.stay_no_play_allowed) {
    rows.push({
      label: 'Stay without playing',
      value: course.stay_no_play_price != null
        ? formatStayPrice(course.stay_no_play_price, course.stay_no_play_unit)
        : <Check />,
    })
  }
  if (course.stay_with_play_allowed) {
    rows.push({
      label: 'Stay & play',
      value: course.stay_with_play_price != null
        ? formatStayPrice(course.stay_with_play_price, course.stay_with_play_unit)
        : <Check />,
    })
  }
  if (course.power) {
    rows.push({
      label: 'Powered site',
      value: course.power_additional_cost != null
        ? <span><span className="text-gray-500">+</span>{formatStayPrice(course.power_additional_cost, course.power_unit)}</span>
        : <Check />,
      hint: 'Additional on top of the stay cost',
    })
  }
  if (course.donation_accepted) {
    rows.push({
      label: 'Donation accepted',
      value: <Check />,
    })
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No specific stay info recorded — contact the course for details.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">{r.label}</div>
            {r.hint && <div className="text-xs text-gray-400 mt-0.5">{r.hint}</div>}
          </div>
          <div className="text-sm text-gray-900 font-medium shrink-0 text-right">{r.value}</div>
        </div>
      ))}
    </div>
  )
}

function Check() {
  return (
    <span className="inline-flex items-center text-green-600" aria-label="Yes">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}
