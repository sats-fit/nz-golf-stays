# Data Scraping Guide

## Steps

### 1. Scrape course list
```bash
npx tsx scripts/scrape/scrape-nzgolf.ts
```
Output: `scripts/seed/courses-raw.json`

**Note:** If the scraper returns 0 results, the nzgolf.org.nz page may be JS-rendered.
In that case, install Playwright and swap the scraper:
```bash
npm install -D playwright
npx playwright install chromium
```
Then modify `scrape-nzgolf.ts` to use `chromium.launch()` instead of `fetch()`.

### 2. Geocode addresses
```bash
GOOGLE_MAPS_API_KEY=your_key npx tsx scripts/scrape/geocode.ts
```
Output: `scripts/seed/courses-geocoded.json`

### 3. Seed Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your_service_key \
npx tsx scripts/seed/seed.ts
```

## Notes
- The scraper targets https://www.nzgolf.org.nz/clubs/find-a-club/
- NZ has ~400 affiliated golf clubs — all within Google Geocoding free tier
- Scraped courses are seeded with `approved: true`
- User-submitted courses land with `approved: false` and need admin approval
- Overnight stay / dogs / power data is crowdsourced via the Submit form
