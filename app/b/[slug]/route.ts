import { NextResponse } from 'next/server'
import supabaseAdmin from '../../../lib/supabaseServer'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params
  const { data: boards } = await supabaseAdmin.from('boards').select('*').eq('slug', slug).limit(1).maybeSingle()
  const board = boards as any
  if (!board) return new Response('Not found', { status: 404 })

  // record scan
  const ua = req.headers.get('user-agent') || null
  const ref = req.headers.get('referer') || req.headers.get('referrer') || null
  const ip = req.headers.get('x-forwarded-for') || null

  try {
    await supabaseAdmin.from('scans').insert([{ board_id: board.id, user_agent: ua, ip_address: ip, referrer: ref }])
    await supabaseAdmin.from('boards').update({ scan_count: (board.scan_count || 0) + 1 }).eq('id', board.id)
  } catch (e) {
    // swallow logging errors
    console.error(e)
  }

  return NextResponse.redirect(board.destination_url)
}
