import { Course } from '@/lib/types'
import { CourseBadges } from './CourseBadges'
import { StayOptionsTable } from './StayOptionsTable'

export function CourseDetail({ course }: { course: Course }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Photo gallery */}
      {course.photos.length > 0 && (
        <div className="mb-8 rounded-2xl overflow-hidden">
          <img
            src={course.photos[0]}
            alt={course.name}
            className="w-full h-72 object-cover"
          />
          {course.photos.length > 1 && (
            <div className="flex gap-2 mt-2">
              {course.photos.slice(1, 4).map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${course.name} photo ${i + 2}`}
                  className="flex-1 h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{course.name}</h1>
        {course.region && (
          <p className="text-gray-500 text-lg">{course.region}</p>
        )}
      </div>

      {/* Badges */}
      <div className="mb-8">
        <CourseBadges course={course} />
      </div>

      {/* Stay options table */}
      {course.overnight_stays && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Stay Options</h2>
          <StayOptionsTable course={course} />
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {course.address && (
          <DetailRow icon="📍" label="Address" value={course.address} />
        )}
        {course.phone && (
          <DetailRow
            icon="📞"
            label="Phone"
            value={
              <a href={`tel:${course.phone}`} className="text-green-600 hover:underline">
                {course.phone}
              </a>
            }
          />
        )}
        {course.website && (
          <DetailRow
            icon="🌐"
            label="Website"
            value={
              <a
                href={course.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline truncate"
              >
                {course.website.replace(/^https?:\/\//, '')}
              </a>
            }
          />
        )}
        <DetailRow
          icon="🐕"
          label="Dogs"
          value={
            course.dogs === 'yes' ? 'Allowed' : course.dogs === 'no' ? 'Not allowed' : 'Unknown'
          }
        />
        <DetailRow
          icon="📋"
          label="Booking"
          value={
            course.booking === 'must_book'
              ? 'Must book ahead'
              : course.booking === 'ask_first'
              ? 'Ask first'
              : course.booking === 'walk_in'
              ? 'Walk-ins welcome'
              : 'Unknown'
          }
        />
      </div>

      {/* Notes */}
      {course.notes && (
        <div className="bg-gray-50 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{course.notes}</p>
        </div>
      )}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="text-xl shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <div className="text-sm text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  )
}
