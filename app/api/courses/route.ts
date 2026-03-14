import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCourses } from '@/lib/supabase/queries'

const courseSchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  overnight_stays: z.boolean().default(false),
  stay_n_play: z.enum(['yes', 'no', 'free_with_gf']).default('no'),
  stay_no_play: z.boolean().default(false),
  stay_no_play_price: z.string().optional(),
  dogs: z.enum(['yes', 'no', 'unknown']).default('unknown'),
  power: z.boolean().default(false),
  ask_first: z.boolean().default(false),
  photos: z.array(z.string().url()).default([]),
  submitted_by: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  const supabase = await createSupabaseServerClient()
  const { data, error } = await getCourses(params, supabase)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = courseSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('courses')
    .insert({ ...result.data, approved: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
