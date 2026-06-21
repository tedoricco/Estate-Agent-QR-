"use client"

import { useState } from "react"
import QRCodePreview from "./QRCodePreview"
import supabase from "../lib/supabaseClient"

type Board = {
  id: string
  name: string
  agent_name?: string
  branch_name?: string
  destination_url: string
  slug: string
  scan_count: number
  analytics?: {
    total: number
    today: number
    this_week: number
    this_month: number
    last_scan: string | null
  }
}

export default function BoardTable({
  boards,
  onChange,
}: {
  boards: Board[]
  onChange?: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name?: string
    agent_name?: string
    branch_name?: string
    destination_url?: string
  }>({})

  const makeFileName = (b: Board) => {
    return `${b.agent_name || "estate-agent"}-${b.branch_name || "branch"}-${b.name || "property"}-qr`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const formatLastScan = (dateString?: string | null) => {
    if (!dateString) return "No scans yet"

    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const del = async (id: string) => {
    const s = await supabase.auth.getSession()
    const token = s.data?.session?.access_token

    await fetch("/api/boards", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    })

    onChange?.()
  }

  const startEdit = (b: Board) => {
    setEditingId(b.id)
    setForm({
      name: b.name,
      agent_name: b.agent_name,
      branch_name: b.branch_name,
      destination_url: b.destination_url,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({})
  }

  const save = async (id: string) => {
    const s = await supabase.auth.getSession()
    const token = s.data?.session?.access_token

    await fetch("/api/boards", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...form }),
    })

    setEditingId(null)
    setForm({})
    onChange?.()
  }

  return (
    <div className="space-y-4">
      {boards.map((b) => {
        const analytics = b.analytics

        return (
          <div key={b.id} className="bg-white p-5 rounded-lg shadow border border-slate-100">
            {editingId === b.id ? (
              <div className="grid gap-2">
                <input
                  className="p-2 border rounded"
                  placeholder="Property address"
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                  className="p-2 border rounded"
                  placeholder="Estate agency"
                  value={form.agent_name ?? ""}
                  onChange={(e) => setForm({ ...form, agent_name: e.target.value })}
                />

                <input
                  className="p-2 border rounded"
                  placeholder="Branch"
                  value={form.branch_name ?? ""}
                  onChange={(e) => setForm({ ...form, branch_name: e.target.value })}
                />

                <input
                  className="p-2 border rounded"
                  placeholder="Property URL / Rightmove link"
                  value={form.destination_url ?? ""}
                  onChange={(e) => setForm({ ...form, destination_url: e.target.value })}
                />

                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                    onClick={() => save(b.id)}
                  >
                    Save
                  </button>

                  <button className="px-3 py-1 border rounded" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="text-xl font-semibold text-slate-900">{b.name}</div>

                  <div className="text-sm text-slate-600 mt-1">
                    {b.agent_name || "No agency"} • {b.branch_name || "No branch"}
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-3 max-w-4xl">
                    <div className="bg-slate-50 border border-slate-100 rounded p-3">
                      <div className="text-xs text-slate-500">Total scans</div>
                      <div className="text-2xl font-semibold">
                        {analytics?.total ?? b.scan_count ?? 0}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3">
                      <div className="text-xs text-slate-500">Today</div>
                      <div className="text-2xl font-semibold">{analytics?.today ?? 0}</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3">
                      <div className="text-xs text-slate-500">This week</div>
                      <div className="text-2xl font-semibold">{analytics?.this_week ?? 0}</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3">
                      <div className="text-xs text-slate-500">This month</div>
                      <div className="text-2xl font-semibold">{analytics?.this_month ?? 0}</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3">
                      <div className="text-xs text-slate-500">Last scan</div>
                      <div className="text-sm font-medium">
                        {formatLastScan(analytics?.last_scan)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    QR ID: <span className="font-mono">{b.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <QRCodePreview slug={String(b.slug)} filename={makeFileName(b)} />

                  <div className="flex flex-col gap-2 text-sm">
                    <a className="text-indigo-600" href={`/b/${b.slug}`} target="_blank">
                      Open property
                    </a>

                    <button className="text-left text-indigo-600" onClick={() => startEdit(b)}>
                      Edit
                    </button>

                    <button className="text-left text-red-600" onClick={() => del(b.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}