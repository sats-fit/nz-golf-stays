/**
 * Backfills missing website / email / phone using the golf.co.nz GetClubDetails API.
 * Matches scraped clubs to DB courses by normalised name, then patches any gaps.
 *
 * Run:
 *   npx ts-node --project tsconfig.json scripts/import/backfill-golfnz.ts
 *   npx ts-node --project tsconfig.json scripts/import/backfill-golfnz.ts --dry-run
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ScrapedClub = {
  region: string
  clubId: number
  name: string
  email: string | null
  phone: string | null
  website: string | null
}

type GolfNZDetails = {
  Website?: string
  Email?: string
  Phone?: string
  ProShopPhone?: string
  Name?: string
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(golf club|golf course|golf resort|golf links|golf & country club|country club|inc|ltd|incorporated)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function getClubDetails(clubId: number): Promise<GolfNZDetails | null> {
  try {
    const res = await fetch(`https://www.golf.co.nz/api/clubs/GetClubDetails?clubId=${clubId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.golf.co.nz/',
      }
    })
    if (!res.ok) return null
    return await res.json() as GolfNZDetails
  } catch {
    return null
  }
}

async function main() {
  const clubsPath = path.join(process.cwd(), 'scripts/golfnz-clubs.json')
  const scraped: ScrapedClub[] = JSON.parse(fs.readFileSync(clubsPath, 'utf-8'))
  console.log(`Scraped clubs with clubIds: ${scraped.length}`)

  const { data: existing, error } = await supabase
    .from('courses')
    .select('id, name, phone, email, website')
  if (error) throw error
  console.log(`DB courses: ${existing!.length}\n`)

  const dbByNorm = new Map(existing!.map(c => [normalise(c.name), c]))

  let updated = 0, skipped = 0, notFound = 0
  const enriched: Record<string, GolfNZDetails> = {}

  for (const club of scraped) {
    const norm = normalise(club.name)
    const dbCourse = dbByNorm.get(norm)

    if (!dbCourse) {
      notFound++
      continue
    }

    // Check if there's anything to fill in
    if (dbCourse.phone && dbCourse.email && dbCourse.website) {
      skipped++
      continue
    }

    await sleep(100)
    const details = await getClubDetails(club.clubId)

    if (!details) {
      console.log(`  ✗ API error for ${club.name} (clubId=${club.clubId})`)
      skipped++
      continue
    }

    enriched[club.name] = details

    const cleanPhone = details.Phone?.trim() || details.ProShopPhone?.trim() || null
    const cleanEmail = details.Email?.trim() || null
    const cleanWebsite = details.Website?.trim() || null

    const patch: Record<string, string> = {}
    if (!dbCourse.phone && cleanPhone) patch.phone = cleanPhone
    if (!dbCourse.email && cleanEmail) patch.email = cleanEmail
    if (!dbCourse.website && cleanWebsite) patch.website = cleanWebsite

    if (Object.keys(patch).length === 0) {
      skipped++
      continue
    }

    const fields = Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', ')
    console.log(`✓ ${club.name} — ${fields}`)

    if (!DRY_RUN) {
      const { error: err } = await supabase.from('courses').update(patch).eq('id', dbCourse.id)
      if (err) {
        console.log(`  ✗ ${err.message}`)
      } else {
        updated++
        // Update local map so we don't double-patch
        dbByNorm.set(norm, { ...dbCourse, ...patch })
      }
    } else {
      updated++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Updated:   ${updated}`)
  console.log(`Skipped:   ${skipped}`)
  console.log(`No match:  ${notFound}`)
  if (DRY_RUN) console.log('\n(dry run — no changes written)')
}

main().catch(console.error)
