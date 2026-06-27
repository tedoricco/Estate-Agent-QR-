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

    const cleanedForm = {
      ...form,
      destination_url: form.destination_url?.trim(),
    }

    const res = await fetch("/api/boards", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...cleanedForm }),
    })

    if (!res.ok) {
      alert("Save failed. Please try again.")
      return
    }

    setEditingId(null)
    setForm({})
    onChange?.()
  }

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault()
      save(id)
    }

    if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }

  return (
    <div className="space-y-4">
      {boards.map((b) => {
        const analytics = b.analytics

        return (
          <div
            key={b.id}
            className="bg-white p-4 sm:p-5 rounded-lg shadow border border-slate-100 overflow-hidden"
          >
            {editingId === b.id ? (
              <div className="grid gap-2">
                <input
                  className="p-2 border rounded"
                  placeholder="Property address"
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => handleEditKeyDown(e, b.id)}
                />

                <input
                  className="p-2 border rounded"
                  placeholder="Estate agency"
                  value={form.agent_name ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, agent_name: e.target.value })
                  }
                  onKeyDown={(e) => handleEditKeyDown(e, b.id)}
                />

                <input
                  className="p-2 border rounded"
                  placeholder="Branch"
                  value={form.branch_name ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, branch_name: e.target.value })
                  }
                  onKeyDown={(e) => handleEditKeyDown(e, b.id)}
                />

                <input
                  className="p-2 border rounded"
                  placeholder="Property URL / Rightmove link"
                  value={form.destination_url ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, destination_url: e.target.value })
                  }
                  onKeyDown={(e) => handleEditKeyDown(e, b.id)}
                />

                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                    onClick={() => save(b.id)}
                  >
                    Save
                  </button>

                  <button
                    className="px-3 py-1 border rounded"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6">
                <div className="min-w-0 flex-1">
                  <div className="text-xl font-semibold text-slate-900 break-words">
                    {b.name}
                  </div>

                  <div className="text-sm text-slate-600 mt-1 break-words">
                    {b.agent_name || "No agency"} • {b.branch_name || "No branch"}
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded p-3 min-w-0">
                      <div className="text-xs text-slate-500">Total scans</div>
                      <div className="text-2xl font-semibold">
                        {analytics?.total ?? b.scan_count ?? 0}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3 min-w-0">
                      <div className="text-xs text-slate-500">Today</div>
                      <div className="text-2xl font-semibold">
                        {analytics?.today ?? 0}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3 min-w-0">
                      <div className="text-xs text-slate-500">This week</div>
                      <div className="text-2xl font-semibold">
                        {analytics?.this_week ?? 0}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3 min-w-0">
                      <div className="text-xs text-slate-500">This month</div>
                      <div className="text-2xl font-semibold">
                        {analytics?.this_month ?? 0}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3 min-w-0 col-span-2 sm:col-span-1">
                      <div className="text-xs text-slate-500">Last scan</div>
                      <div className="text-sm font-medium break-words">
                        {formatLastScan(analytics?.last_scan)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 break-all">
                    QR ID: <span className="font-mono">{b.slug}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center gap-4 sm:gap-5">
                  <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                    <QRCodePreview slug={String(b.slug)} filename={makeFileName(b)} />
                  </div>

                  <div className="w-full sm:w-auto flex flex-col gap-2 text-sm">
                    <a
                      className="text-indigo-600"
                      href={`/b/${b.slug}`}
                      target="_blank"
                    >
                      Open property
                    </a>

                    <button
                      className="text-left text-indigo-600"
                      onClick={() => startEdit(b)}
                    >
                      Edit
                    </button>

                    <button
                      className="text-left text-red-600"
                      onClick={() => del(b.id)}
                    >
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