/**
 * Imports overnight-stay data from the curated xlsx sheets:
 *   - North Island Facilities 2026.xlsx
 *   - South Island Facilities 2026.xlsx
 *
 * Each row tells us, for one club, which stay arrangements are offered (free with green
 * fees / pay no-play / pay with-play / donation), at what price/unit, plus power site
 * cost, dog policy and whether you must ask first.
 *
 * Treats the xlsx as canonical: any DB course NOT in either sheet has its stay flags
 * reset and overnight_stays set to false.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/import/import-stays.ts --dry-run
 *   npx ts-node --project tsconfig.json scripts/import/import-stays.ts
 *
 * Output:
 *   scripts/import/unmatched-stays.json — xlsx rows that didn't match a DB course
 */
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const XLSX_FILES = [
  { path: 'North Island Facilities 2026.xlsx', island: 'North' },
  { path: 'South Island Facilities 2026.xlsx', island: 'South' },
]

type StayUnit = 'per_night' | 'per_person' | 'per_vehicle' | 'per_person_per_night'
type PowerUnit = 'per_night' | 'per_vehicle'

type ParsedCell = {
  /** true = explicitly allowed, false = explicitly not allowed, null = blank/unknown */
  allowed: boolean | null
  /** numeric price, null if "Yes" without amount or n/c */
  price: number | null
  /** unit suffix from the cell (only meaningful when price is set) */
  unit: StayUnit | null
}

type ParsedRow = {
  source: string
  name: string
  freeWithGreenFees: boolean
  noPlay: ParsedCell
  withPlay: ParsedCell
  power: ParsedCell
  ask: boolean
  donation: boolean
  dogs: 'yes' | 'no' | null
  /** the raw row object, kept for the unmatched dump so a human can debug */
  raw: Record<string, unknown>
}

type CoursePatch = {
  overnight_stays: boolean
  free_with_green_fees: boolean
  stay_no_play_allowed: boolean
  stay_no_play_price: number | null
  stay_no_play_unit: StayUnit | null
  stay_with_play_allowed: boolean
  stay_with_play_price: number | null
  stay_with_play_unit: StayUnit | null
  donation_accepted: boolean
  power: boolean
  power_additional_cost: number | null
  power_unit: PowerUnit | null
  dogs?: 'yes' | 'no'
  booking?: 'ask_first'
}

/* ---------------------------------- parsing ---------------------------------- */

function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(golf club|golf course|golf resort|golf links|golf & country club|country club|inc|ltd|incorporated)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const SUFFIX_TO_UNIT: Record<string, StayUnit> = {
  pppn: 'per_person_per_night',
  pn:   'per_night',
  pp:   'per_person',
  pv:   'per_vehicle',
}

function parsePriceCell(raw: unknown): ParsedCell {
  if (raw == null) return { allowed: null, price: null, unit: null }
  const s = String(raw).trim()
  if (s === '') return { allowed: null, price: null, unit: null }

  // Explicit no
  if (/^no\b/i.test(s)) return { allowed: false, price: null, unit: null }

  // Stripped: drop $ prefix, lowercase
  const cleaned = s.replace(/[$,]/g, '').toLowerCase()

  // n/c → no charge, allowed but free
  if (/n\/?c/.test(cleaned)) return { allowed: true, price: 0, unit: null }

  // Match optional digits followed by optional unit suffix (pn|pp|pv|pppn)
  // Examples we accept: "10pn", "5pp", "20pv", "5pppn", "10", "20"
  // 'pppn' must be tested before 'pn'/'pp' since it overlaps.
  const m = cleaned.match(/^(\d+(?:\.\d+)?)\s*(pppn|pn|pp|pv)?\b/)
  if (m) {
    const price = Number(m[1])
    const unit = m[2] ? SUFFIX_TO_UNIT[m[2]] : null
    return { allowed: true, price, unit }
  }

  // "Yes" or any other non-empty non-numeric value (e.g. "One" sites count) — allowed,
  // but price/unit unknown. Caller decides what to do with that.
  if (/^yes\b/i.test(s)) return { allowed: true, price: null, unit: null }
  return { allowed: true, price: null, unit: null }
}

function parseDogsAndDonation(raw: unknown): { dogs: 'yes' | 'no' | null; donation: boolean } {
  if (raw == null) return { dogs: null, donation: false }
  const tokens = String(raw).toUpperCase().split(/\s+/).filter(Boolean)
  let dogs: 'yes' | 'no' | null = null
  let donation = false
  for (const t of tokens) {
    if (t === 'DA') dogs = 'yes'
    else if (t === 'ND') dogs = 'no'
    else if (t === 'D') donation = true
  }
  return { dogs, donation }
}

function pickHeaderRow(rows: unknown[][]): { headerIdx: number; cols: Record<string, number> } {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const cells = rows[i].map(c => String(c ?? '').trim())
    if (cells[0]?.toLowerCase() === 'club') {
      const cols: Record<string, number> = {}
      cells.forEach((c, idx) => {
        const key = c.trim()
        // Header has a stray 'D ND DA ' label for the dogs/donation column — match its first letter.
        if (key === 'Club') cols.club = idx
        else if (key === 'F') cols.f = idx
        else if (key === 'P') cols.p = idx
        else if (key === 'NP') cols.np = idx
        else if (key === 'A') cols.a = idx
        else if (key === 'SP') cols.sp = idx
        else if (/^D\s*ND\s*DA/i.test(key)) cols.g = idx
      })
      return { headerIdx: i, cols }
    }
  }
  throw new Error('Could not find header row')
}

function parseSheet(filePath: string, source: string): ParsedRow[] {
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null })
  const { headerIdx, cols } = pickHeaderRow(rows)

  const out: ParsedRow[] = []
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    const name = (row[cols.club] ?? '').toString().trim()
    if (!name) continue

    const fCell = row[cols.f]
    const pCell = row[cols.p]
    const npCell = row[cols.np]
    const aCell = row[cols.a]
    const spCell = row[cols.sp]
    const gCell = row[cols.g]

    const freeWithGreenFees = /yes/i.test(String(fCell ?? ''))
    const noPlay = parsePriceCell(npCell)
    const withPlay = parsePriceCell(spCell)
    const power = parsePriceCell(pCell)
    const ask = /yes/i.test(String(aCell ?? ''))
    const { dogs, donation } = parseDogsAndDonation(gCell)

    out.push({
      source,
      name,
      freeWithGreenFees,
      noPlay,
      withPlay,
      power,
      ask,
      donation,
      dogs,
      raw: { Club: name, F: fCell, P: pCell, NP: npCell, A: aCell, SP: spCell, Dogs: gCell },
    })
  }
  return out
}

/* ----------------------------------- mapping ---------------------------------- */

function buildPatch(row: ParsedRow): CoursePatch {
  // power_unit must be PowerUnit (per_night | per_vehicle); collapse the wider StayUnit safely.
  const powerUnit: PowerUnit | null =
    row.power.unit === 'per_vehicle' ? 'per_vehicle'
    : row.power.unit === 'per_night' ? 'per_night'
    : null

  const patch: CoursePatch = {
    overnight_stays: true,
    free_with_green_fees: row.freeWithGreenFees,
    stay_no_play_allowed: row.noPlay.allowed === true,
    stay_no_play_price:   row.noPlay.allowed === true ? row.noPlay.price : null,
    stay_no_play_unit:    row.noPlay.allowed === true ? row.noPlay.unit  : null,
    stay_with_play_allowed: row.withPlay.allowed === true,
    stay_with_play_price:   row.withPlay.allowed === true ? row.withPlay.price : null,
    stay_with_play_unit:    row.withPlay.allowed === true ? row.withPlay.unit  : null,
    donation_accepted: row.donation,
    power: row.power.allowed === true,
    power_additional_cost: row.power.allowed === true ? row.power.price : null,
    power_unit:            row.power.allowed === true ? powerUnit       : null,
  }
  if (row.dogs) patch.dogs = row.dogs
  if (row.ask) patch.booking = 'ask_first'
  return patch
}

/* ------------------------------------ main ------------------------------------ */

async function main() {
  // 1. Parse both sheets
  const allRows: ParsedRow[] = []
  for (const file of XLSX_FILES) {
    const full = path.join(process.cwd(), file.path)
    if (!fs.existsSync(full)) {
      console.warn(`⚠ Skipping (not found): ${file.path}`)
      continue
    }
    const parsed = parseSheet(full, file.island)
    console.log(`Parsed ${file.island}: ${parsed.length} rows`)
    allRows.push(...parsed)
  }
  console.log(`Total xlsx rows: ${allRows.length}\n`)

  // 2. Load all DB courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, overnight_stays')
  if (error) throw error
  console.log(`DB courses: ${courses!.length}\n`)

  const dbByNorm = new Map(courses!.map(c => [normalise(c.name), c]))

  // 3. Match each xlsx row → patch DB
  let updated = 0
  const unmatched: ParsedRow[] = []
  const matchedIds = new Set<string>()

  for (const row of allRows) {
    const norm = normalise(row.name)
    const dbCourse = dbByNorm.get(norm)
    if (!dbCourse) {
      unmatched.push(row)
      continue
    }
    matchedIds.add(dbCourse.id)
    const patch = buildPatch(row)

    const summary = describePatch(patch)
    console.log(`UPDATE  ${row.source} · ${row.name}`)
    console.log(`        ${summary}`)

    if (!DRY_RUN) {
      const { error } = await supabase.from('courses').update(patch).eq('id', dbCourse.id)
      if (error) { console.log(`        ✗ ${error.message}`); continue }
      console.log('        ✓')
    }
    updated++
  }

  // 4. Sweep DB courses NOT in xlsx — reset their stay state (xlsx is canonical)
  const RESET: CoursePatch = {
    overnight_stays: false,
    free_with_green_fees: false,
    stay_no_play_allowed: false,
    stay_no_play_price: null,
    stay_no_play_unit: null,
    stay_with_play_allowed: false,
    stay_with_play_price: null,
    stay_with_play_unit: null,
    donation_accepted: false,
    power: false,
    power_additional_cost: null,
    power_unit: null,
  }

  let cleared = 0
  let alreadyClear = 0
  for (const c of courses!) {
    if (matchedIds.has(c.id)) continue
    if (!c.overnight_stays) { alreadyClear++; continue }
    console.log(`CLEAR   ${c.name} (not in xlsx)`)
    if (!DRY_RUN) {
      const { error } = await supabase.from('courses').update(RESET).eq('id', c.id)
      if (error) { console.log(`        ✗ ${error.message}`); continue }
    }
    cleared++
  }

  // 5. Write unmatched rows for review
  const unmatchedPath = path.join(process.cwd(), 'scripts/import/unmatched-stays.json')
  fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2))

  // 6. Summary
  console.log('\n' + '─'.repeat(50))
  console.log(`Matched & updated:   ${updated}`)
  console.log(`Cleared (not in xlsx): ${cleared} (${alreadyClear} already off)`)
  console.log(`Unmatched xlsx rows: ${unmatched.length}  → ${unmatchedPath}`)
  if (DRY_RUN) console.log('\n(dry run — no changes written)')
}

function describePatch(p: CoursePatch): string {
  const bits: string[] = []
  if (p.free_with_green_fees) bits.push('free-w/-gf')
  if (p.stay_no_play_allowed) bits.push(`no-play${p.stay_no_play_price != null ? `=$${p.stay_no_play_price}${p.stay_no_play_unit ? '/' + p.stay_no_play_unit : ''}` : ''}`)
  if (p.stay_with_play_allowed) bits.push(`with-play${p.stay_with_play_price != null ? `=$${p.stay_with_play_price}${p.stay_with_play_unit ? '/' + p.stay_with_play_unit : ''}` : ''}`)
  if (p.donation_accepted) bits.push('donation')
  if (p.power) bits.push(`power${p.power_additional_cost != null ? `=+$${p.power_additional_cost}${p.power_unit ? '/' + p.power_unit : ''}` : ''}`)
  if (p.dogs) bits.push(`dogs=${p.dogs}`)
  if (p.booking) bits.push(`booking=${p.booking}`)
  return bits.length === 0 ? '(no stay options recorded)' : bits.join(' · ')
}

main().catch(err => { console.error(err); process.exit(1) })
