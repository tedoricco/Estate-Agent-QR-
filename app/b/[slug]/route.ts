import { NextResponse } from "next/server"
import supabaseAdmin from "../../../lib/supabaseServer"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const { data: board, error: boardError } = await supabaseAdmin
    .from("boards")
    .select("id, destination_url, scan_count")
    .eq("slug", slug)
    .maybeSingle()

  if (boardError) {
    console.error("Board lookup error:", boardError)
    return new Response("Server error", { status: 500 })
  }

  if (!board) {
    return new Response("Not found", { status: 404 })
  }

  const ua = req.headers.get("user-agent") || null
  const ref = req.headers.get("referer") || req.headers.get("referrer") || null
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    null

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

  return NextResponse.redirect(new URL(board.destination_url), {
    status: 302,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}