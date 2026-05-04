/**
 * Lists rows in the xlsx sheets whose dogs/donation column contains the "D" token,
 * meaning donations are accepted. Also queries Supabase for courses with
 * donation_accepted=true so we can spot mismatches.
 */
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: '.env.local' })

const FILES = [
  { path: 'North Island Facilities 2026.xlsx', island: 'North' },
  { path: 'South Island Facilities 2026.xlsx', island: 'South' },
]

function pickHeader(rows: unknown[][]) {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const cells = rows[i].map(c => String(c ?? '').trim())
    if (cells[0]?.toLowerCase() === 'club') {
      const cols: Record<string, number> = {}
      cells.forEach((c, idx) => {
        const k = c.trim()
        if (k === 'Club') cols.club = idx
        else if (/^D\s*ND\s*DA/i.test(k)) cols.g = idx
      })
      return { headerIdx: i, cols }
    }
  }
  throw new Error('no header')
}

async function main() {
  const xlsxDonations: { island: string; name: string; raw: string }[] = []
  for (const f of FILES) {
    const wb = XLSX.readFile(path.join(process.cwd(), f.path))
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null })
    const { headerIdx, cols } = pickHeader(rows)
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i]
      const name = (r[cols.club] ?? '').toString().trim()
      if (!name) continue
      const g = (r[cols.g] ?? '').toString().trim()
      const tokens = g.toUpperCase().split(/\s+/).filter(Boolean)
      if (tokens.includes('D')) xlsxDonations.push({ island: f.island, name, raw: g })
    }
  }

  console.log(`\nXLSX rows with donation flag (${xlsxDonations.length}):`)
  for (const r of xlsxDonations) console.log(`  [${r.island}] ${r.name}  (col raw: "${r.raw}")`)

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await sb.from('courses').select('id, name, region, donation_accepted').eq('donation_accepted', true)
  if (error) { console.error(error); process.exit(1) }
  console.log(`\nDB courses with donation_accepted=true (${data!.length}):`)
  for (const c of data!) console.log(`  ${c.name} — ${c.region}`)
}

main().catch(e => { console.error(e); process.exit(1) })
