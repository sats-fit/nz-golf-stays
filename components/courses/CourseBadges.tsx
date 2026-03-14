import { Badge } from '@/components/ui/Badge'
import { Course } from '@/lib/types'

export function CourseBadges({ course }: { course: Course }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {course.overnight_stays && (
        <Badge variant="green">Overnight Stays</Badge>
      )}
      {course.stay_n_play === 'yes' && (
        <Badge variant="blue">Stay & Play</Badge>
      )}
      {course.stay_n_play === 'free_with_gf' && (
        <Badge variant="blue">Free w/ Green Fees</Badge>
      )}
      {course.stay_no_play && (
        <Badge variant="yellow">
          Stay No Play{course.stay_no_play_price ? ` · ${course.stay_no_play_price}` : ''}
        </Badge>
      )}
      {course.dogs === 'yes' && (
        <Badge variant="orange">Dogs OK</Badge>
      )}
      {course.power && (
        <Badge variant="gray">Power</Badge>
      )}
      {course.ask_first && (
        <Badge variant="gray">Ask First</Badge>
      )}
    </div>
  )
}
