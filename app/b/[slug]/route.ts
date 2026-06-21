import { NextResponse } from "next/server"
import supabaseAdmin from "../../../lib/supabaseServer"

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const { data: board, error } = await supabaseAdmin
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(error)
    return new Response("Server error", { status: 500 })
  }

  if (!board) {
    return new Response("Not found", { status: 404 })
  }

  const ua = req.headers.get("user-agent") || null
  const ref = req.headers.get("referer") || req.headers.get("referrer") || null
  const ip = req.headers.get("x-forwarded-for") || null

  try {
    await supabaseAdmin.from("scans").insert([
      {
        board_id: board.id,
        user_agent: ua,
        ip_address: ip,
        referrer: ref,
      },
    ])

    await supabaseAdmin
      .from("boards")
      .update({ scan_count: (board.scan_count || 0) + 1 })
      .eq("id", board.id)
  } catch (e) {
    console.error(e)
  }

  return NextResponse.redirect(board.destination_url)
}