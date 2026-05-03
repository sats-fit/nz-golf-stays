import { Badge } from '@/components/ui/Badge'
import { Course } from '@/lib/types'
import { formatStayPrice } from '@/lib/utils'

export function CourseBadges({ course }: { course: Course }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {course.overnight_stays && (
        <Badge variant="green">Overnight Stays</Badge>
      )}
      {course.free_with_green_fees && (
        <Badge variant="blue">Free w/ Green Fees</Badge>
      )}
      {course.stay_no_play_allowed && (
        <Badge variant="yellow">
          Stay no-play{course.stay_no_play_price != null
            ? ` · ${formatStayPrice(course.stay_no_play_price, course.stay_no_play_unit, { short: true })}`
            : ''}
        </Badge>
      )}
      {course.stay_with_play_allowed && (
        <Badge variant="yellow">
          Stay & play{course.stay_with_play_price != null
            ? ` · ${formatStayPrice(course.stay_with_play_price, course.stay_with_play_unit, { short: true })}`
            : ''}
        </Badge>
      )}
      {course.donation_accepted && (
        <Badge variant="yellow">Donation</Badge>
      )}
      {course.power && (
        <Badge variant="gray">
          Power{course.power_additional_cost != null
            ? ` +${formatStayPrice(course.power_additional_cost, course.power_unit, { short: true })}`
            : ''}
        </Badge>
      )}
      {course.dogs === 'yes' && (
        <Badge variant="orange">Dogs OK</Badge>
      )}
      {(course.booking === 'ask_first' || course.booking === 'must_book') && (
        <Badge variant="gray">{course.booking === 'must_book' ? 'Must book' : 'Ask first'}</Badge>
      )}
    </div>
  )
}
