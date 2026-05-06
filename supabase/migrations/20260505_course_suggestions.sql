-- Allows a pending course record to be a "suggested edit" for an existing approved course.
-- When an admin approves a suggestion, the app merges the suggestion's fields into the
-- original course and deletes the suggestion record.
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS suggestion_for_course_id uuid REFERENCES courses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_courses_suggestion_for
  ON courses(suggestion_for_course_id)
  WHERE suggestion_for_course_id IS NOT NULL;
