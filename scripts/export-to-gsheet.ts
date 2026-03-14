/**
 * Exports all courses to a new Google Sheet: name, region, website, email, phone.
 *
 * Setup (one-time):
 *   1. Google Cloud Console → your project → Enable "Google Sheets API"
 *   2. IAM & Admin → Service Accounts → Create service account → Download JSON key
 *   3. Save key file as scripts/service-account.json
 *   4. Add to .env.local: GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./scripts/service-account.json
 *
 * Run with: npx ts-node --project tsconfig.json scripts/export-to-gsheet.ts
 */
import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Load service account
  const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
  if (!keyFilePath) {
    console.error('Set GOOGLE_SERVICE_ACCOUNT_KEY_FILE in .env.local')
    process.exit(1)
  }
  const keyFile = path.resolve(process.cwd(), keyFilePath)
  if (!fs.existsSync(keyFile)) {
    console.error(`Service account key not found at: ${keyFile}`)
    process.exit(1)
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  // Fetch courses
  console.log('Fetching courses from Supabase...')
  const { data: courses, error } = await supabase
    .from('courses')
    .select('name, region, website, email, phone')
    .eq('approved', true)
    .order('region', { ascending: true })
    .order('name', { ascending: true })

  if (error) { console.error(error); process.exit(1) }
  if (!courses?.length) { console.log('No courses found.'); return }

  console.log(`Exporting ${courses.length} courses to Google Sheets...`)

  // Build rows
  const header = ['Course Name', 'Region', 'Website', 'Email', 'Phone']
  const rows = courses.map(c => [
    c.name ?? '',
    c.region ?? '',
    c.website ?? '',
    c.email ?? '',
    c.phone ?? '',
  ])

  // Create spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `NZ Golf Courses — Contact Export ${new Date().toLocaleDateString('en-NZ')}` },
      sheets: [{ properties: { title: 'Courses' } }],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`

  // Write data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Courses!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [header, ...rows] },
  })

  // Format header row bold
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        repeatCell: {
          range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true } } },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      }, {
        autoResizeDimensions: {
          dimensions: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 5 },
        },
      }],
    },
  })

  console.log(`\n✓ Done! ${courses.length} courses exported.`)
  console.log(`\nGoogle Sheet: ${spreadsheetUrl}\n`)
}

main().catch(console.error)
