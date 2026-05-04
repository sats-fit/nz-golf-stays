/**
 * Scrapes phone / email from club websites for courses that already have a website
 * but are missing phone and/or email.
 *
 * Run:
 *   npx ts-node --project tsconfig.json scripts/import/scrape-websites-contact.ts
 *   npx ts-node --project tsconfig.json scripts/import/scrape-websites-contact.ts --dry-run
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function extractEmails(html: string): string[] {
  const matches = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? []
  return [...new Set(matches)].filter(e =>
    !e.includes('example') && !e.includes('yourdomain') && !e.includes('sentry') &&
    !e.includes('wix') && !e.includes('placeholder') && !e.match(/\.(png|jpg|gif|svg|css|js)$/)
  )
}

function extractPhones(html: string): string[] {
  // NZ phone patterns: 0x xxx xxxx, +64 x xxx xxxx, (0x) xxx xxxx
  const matches = html.match(/(?:\+64|0)[\s\-]?(?:\d[\s\-]?){7,9}\d/g) ?? []
  return [...new Set(matches.map(p => p.trim()).filter(p => p.replace(/\D/g, '').length >= 8))]
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function findContact(baseUrl: string): Promise<{ email?: string; phone?: string }> {
  // Try main page first, then /contact
  const urls = [baseUrl, baseUrl.replace(/\/$/, '') + '/contact', baseUrl.replace(/\/$/, '') + '/contact-us']

  let bestEmail: string | undefined
  let bestPhone: string | undefined

  for (const url of urls) {
    if (url.includes('facebook.com') || url.includes('sporty.co.nz') || url.includes('nzdf.mil') || url.includes('airforce.mil') || url.includes('golf.co.nz')) {
      break // Skip social/generic pages — won't have structured contact
    }
    const html = await fetchPage(url)
    if (!html) continue

    const emails = extractEmails(html)
    const phones = extractPhones(html)

    if (!bestEmail && emails.length > 0) bestEmail = emails[0]
    if (!bestPhone && phones.length > 0) bestPhone = phones[0]

    if (bestEmail && bestPhone) break
    await sleep(300)
  }

  return { email: bestEmail, phone: bestPhone }
}

async function main() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, region, phone, email, website')
    .eq('approved', true)
    .not('website', 'is', null)
    .order('name')
  if (error) throw error

  const targets = data!.filter(c => c.website && (!c.phone || !c.email))
  console.log(`Courses with website but missing phone/email: ${targets.length}\n`)

  let updated = 0

  for (const course of targets) {
    if (!course.website) continue
    process.stdout.write(`Scraping ${course.name}... `)

    const contact = await findContact(course.website)

    const patch: Record<string, string> = {}
    if (!course.email && contact.email) patch.email = contact.email
    if (!course.phone && contact.phone) patch.phone = contact.phone

    if (Object.keys(patch).length === 0) {
      console.log('no new data')
      continue
    }

    const fields = Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', ')
    console.log(`✓ ${fields}`)

    if (!DRY_RUN) {
      const { error: err } = await supabase.from('courses').update(patch).eq('id', course.id)
      if (err) console.log(`  ✗ ${err.message}`)
      else updated++
    } else {
      updated++
    }

    await sleep(200)
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Updated: ${updated} / ${targets.length}`)
  if (DRY_RUN) console.log('(dry run — no changes written)')
}

main().catch(console.error)
