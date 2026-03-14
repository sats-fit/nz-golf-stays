/**
 * Scrapes course websites for email addresses and missing phone numbers.
 * Stores results in Supabase.
 *
 * Run with: npx ts-node --project tsconfig.json scripts/scrape-websites.ts
 * Use --all to re-scrape courses that already have an email.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as cheerio from 'cheerio'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const PHONE_NZ_RE = /(?:(?:\+?64|0)[\s.\-]?(?:800|900|2\d|3|4|6|7|9)[\s.\-]?\d{3}[\s.\-]?\d{4}|\(0\d\)[\s.\-]?\d{3}[\s.\-]?\d{4})/g

const JUNK_EMAIL_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'bounce', 'mailer-daemon', 'postmaster']
const JUNK_DOMAINS = ['.png', '.jpg', '.gif', '.svg', '.webp', '.pdf', '.woff', '.ttf']

function cleanEmails(raw: RegExpMatchArray | null): string[] {
  if (!raw) return []
  return [...new Set(raw)].filter(e => {
    const lower = e.toLowerCase()
    if (JUNK_EMAIL_PREFIXES.some(p => lower.startsWith(p))) return false
    if (JUNK_DOMAINS.some(d => lower.includes(d))) return false
    return true
  })
}

function cleanPhones(raw: RegExpMatchArray | null): string[] {
  if (!raw) return []
  return [...new Set(raw.map(p => p.replace(/\s+/g, ' ').trim()))]
}

async function fetchPage(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NZGolfBot/1.0)' },
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('html')) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractFromHtml(html: string) {
  const $ = cheerio.load(html)
  // Remove script/style noise
  $('script, style, noscript').remove()
  const text = $.html()
  const emails = cleanEmails(text.match(EMAIL_RE))
  const phones = cleanPhones(text.match(PHONE_NZ_RE))
  return { emails, phones }
}

async function scrapeWebsite(baseUrl: string, hasPhone: boolean) {
  const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  const origin = new URL(url).origin

  let emails: string[] = []
  let phones: string[] = []

  // Try homepage
  const homePage = await fetchPage(url)
  if (homePage) {
    const result = extractFromHtml(homePage)
    emails = result.emails
    phones = result.phones
  }

  // If no email found, try /contact and /about pages
  if (emails.length === 0) {
    for (const path of ['/contact', '/contact-us', '/about', '/about-us']) {
      await sleep(300)
      const page = await fetchPage(`${origin}${path}`)
      if (page) {
        const result = extractFromHtml(page)
        if (result.emails.length > 0) { emails = result.emails; break }
        if (!hasPhone && result.phones.length > 0) phones = result.phones
      }
    }
  }

  return {
    email: emails[0] ?? null,
    phone: (!hasPhone && phones.length > 0) ? phones[0] : null,
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const refreshAll = process.argv.includes('--all')

  let query = supabase
    .from('courses')
    .select('id, name, website, phone, email')
    .not('website', 'is', null)
    .order('name')

  if (!refreshAll) {
    query = query.is('email', null)
  }

  const { data: courses, error } = await query
  if (error) { console.error(error); process.exit(1) }
  if (!courses?.length) { console.log('No courses to scrape.'); return }

  console.log(`Scraping ${courses.length} course websites...\n`)

  let foundEmails = 0
  let foundPhones = 0
  let failed = 0

  for (const course of courses) {
    process.stdout.write(`  ${course.name} ... `)
    const hasPhone = !!course.phone

    const result = await scrapeWebsite(course.website!, hasPhone)

    if (result.email || result.phone) {
      const update: Record<string, string> = {}
      if (result.email) { update.email = result.email; foundEmails++ }
      if (result.phone) { update.phone = result.phone; foundPhones++ }

      await supabase.from('courses').update(update).eq('id', course.id)
      console.log(`✓ email=${result.email ?? '—'} phone=${result.phone ?? '—'}`)
    } else {
      console.log('nothing found')
      failed++
    }

    await sleep(500)
  }

  console.log(`\nDone! Found ${foundEmails} emails, ${foundPhones} phone numbers. ${failed} yielded nothing.`)
}

main().catch(console.error)
