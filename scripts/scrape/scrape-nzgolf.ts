/**
 * Scraper for NZ Golf courses
 *
 * Targets Golf New Zealand club finder:
 * https://www.nzgolf.org.nz/clubs/find-a-club/
 *
 * Run with: npx tsx scripts/scrape/scrape-nzgolf.ts
 * Output: scripts/seed/courses-raw.json
 */

import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

type RawCourse = {
  name: string
  address: string | null
  region: string | null
  phone: string | null
  website: string | null
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NZGolfScraper/1.0)',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function scrapeNZGolf(): Promise<RawCourse[]> {
  const BASE_URL = 'https://www.nzgolf.org.nz/clubs/find-a-club/'
  console.log(`Fetching ${BASE_URL}...`)

  const html = await fetchPage(BASE_URL)
  const $ = cheerio.load(html)

  const courses: RawCourse[] = []

  // NOTE: These selectors need to be verified against the live HTML.
  // Inspect https://www.nzgolf.org.nz/clubs/find-a-club/ in Chrome DevTools
  // and update the selectors below to match the actual structure.

  // Common patterns for club listing pages:
  $('table tbody tr, .club-item, .club-listing, article').each((_, el) => {
    const $el = $(el)

    const name =
      $el.find('h2, h3, .club-name, td:first-child a').first().text().trim() ||
      $el.find('a').first().text().trim()

    if (!name) return

    const address =
      $el.find('.club-address, .address, td:nth-child(2)').text().trim() || null

    const region =
      $el.find('.club-region, .region, td:nth-child(3)').text().trim() || null

    const phone =
      $el.find('.club-phone, .phone, td:nth-child(4)').text().trim() || null

    const website =
      $el.find('a[href^="http"]').attr('href') ||
      $el.find('a.club-website').attr('href') ||
      null

    courses.push({ name, address, region, phone, website })
  })

  return courses
}

async function main() {
  const courses = await scrapeNZGolf()
  console.log(`Found ${courses.length} courses`)

  // If scraper found nothing, the selectors need updating.
  // Check the page HTML and update the selectors above.
  if (courses.length === 0) {
    console.warn('No courses found. The site may be JS-rendered or selectors need updating.')
    console.warn('Try running with Playwright instead (see scripts/scrape/README.md)')
  }

  const outPath = path.join(__dirname, '../seed/courses-raw.json')
  fs.writeFileSync(outPath, JSON.stringify(courses, null, 2))
  console.log(`Written to ${outPath}`)
}

main().catch(console.error)
