/**
 * Exports all courses to a CSV file: name, region, website, email, phone.
 * Run with: npx ts-node --project tsconfig.json scripts/export-courses-csv.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function csvEscape(val: string | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

async function main() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('name, region, website, email, phone')
    .eq('approved', true)
    .order('region', { ascending: true })
    .order('name', { ascending: true })

  if (error) { console.error(error); process.exit(1) }
  if (!courses?.length) { console.log('No courses found.'); return }

  const rows = [
    ['Course Name', 'Region', 'Website', 'Email', 'Phone'],
    ...courses.map(c => [c.name, c.region, c.website, c.email, c.phone]),
  ]

  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n')
  const outPath = path.join(process.cwd(), 'scripts', 'courses-export.csv')
  fs.writeFileSync(outPath, csv, 'utf-8')

  console.log(`✓ Exported ${courses.length} courses to scripts/courses-export.csv`)
}

main().catch(console.error)
