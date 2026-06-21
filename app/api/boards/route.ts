import { NextResponse } from "next/server"
import supabaseAdmin from "../../../lib/supabaseServer"

type BoardRow = {
  id: string
  created_at: string
  name: string
  destination_url: string
  slug: string
  scan_count: number | null
  agent_name?: string | null
  branch_name?: string | null
}

type ScanRow = {
  board_id: string
  created_at: string
}

async function authorize(req: Request) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.split(" ")[1]

  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) return null

  const email = data.user.email

  if (email !== process.env.ADMIN_EMAIL) return null

  return data.user
}

export async function GET(req: Request) {
  try {
    const user = await authorize(req)

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: boards, error: boardsError } = await supabaseAdmin
      .from("boards")
      .select("*")
      .order("created_at", { ascending: false })

    if (boardsError) {
      return NextResponse.json({ error: boardsError.message }, { status: 500 })
    }

    const { data: scans, error: scansError } = await supabaseAdmin
      .from("scans")
      .select("board_id, created_at")

    if (scansError) {
      return NextResponse.json({ error: scansError.message }, { status: 500 })
    }

    const boardRows = (boards ?? []) as BoardRow[]
    const scanRows = (scans ?? []) as ScanRow[]

    const now = new Date()

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay()
    const diffToMonday = day === 0 ? 6 : day - 1
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const boardsWithAnalytics = boardRows.map((board) => {
      const boardScans = scanRows.filter((scan) => scan.board_id === board.id)

      const todayScans = boardScans.filter((scan) => {
        return new Date(scan.created_at) >= startOfToday
      })

      const weekScans = boardScans.filter((scan) => {
        return new Date(scan.created_at) >= startOfWeek
      })

      const monthScans = boardScans.filter((scan) => {
        return new Date(scan.created_at) >= startOfMonth
      })

      const sortedScans = [...boardScans].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      return {
        ...board,
        analytics: {
          total: boardScans.length,
          today: todayScans.length,
          this_week: weekScans.length,
          this_month: monthScans.length,
          last_scan: sortedScans[0]?.created_at ?? null,
        },
      }
    })

    return NextResponse.json(boardsWithAnalytics)
  } catch (error) {
    console.error("API /api/boards GET error:", error)
    return NextResponse.json({ error: "internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await authorize(req)

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, agent_name, branch_name, destination_url, slug } = body

    const { data, error } = await supabaseAdmin
      .from("boards")
      .insert([{ name, agent_name, branch_name, destination_url, slug }])
      .select()
      .single()

    if (error) {
      console.error("API /api/boards POST supabase error:", error)

      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          { error: error.message ?? String(error), details: error },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: error.message ?? "internal server error" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API /api/boards POST error:", error)

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { error: String(error), details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await authorize(req)

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "missing id" }, { status: 400 })
    }

    const { error: scansError } = await supabaseAdmin
      .from("scans")
      .delete()
      .eq("board_id", id)

    if (scansError) {
      return NextResponse.json({ error: scansError.message }, { status: 500 })
    }

    const { error: boardError } = await supabaseAdmin
      .from("boards")
      .delete()
      .eq("id", id)

    if (boardError) {
      return NextResponse.json({ error: boardError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("API /api/boards DELETE error:", error)
    return NextResponse.json({ error: "internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await authorize(req)

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, agent_name, branch_name, destination_url } = body

    if (!id) {
      return NextResponse.json({ error: "missing id" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (name !== undefined) updates.name = name
    if (agent_name !== undefined) updates.agent_name = agent_name
    if (branch_name !== undefined) updates.branch_name = branch_name
    if (destination_url !== undefined) updates.destination_url = destination_url

    const { data, error } = await supabaseAdmin
      .from("boards")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API /api/boards PATCH error:", error)
    return NextResponse.json({ error: "internal server error" }, { status: 500 })
  }
}