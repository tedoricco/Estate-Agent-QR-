'use client'
import { useState } from 'react'
import supabase from '../lib/supabaseClient'

type Props = {
  onCreated?: () => void
}

export default function BoardForm({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [agentName, setAgentName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const s = await supabase.auth.getSession()
    const token = s.data?.session?.access_token

    await fetch('/api/boards', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        agent_name: agentName,
        branch_name: branchName,
        destination_url: destinationUrl,
        slug
      })
    })

    setLoading(false)
    setName('')
    setAgentName('')
    setBranchName('')
    setDestinationUrl('')
    setSlug('')
    onCreated?.()
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <h3 className="font-medium mb-3">Create Property QR</h3>

      <div className="grid grid-cols-1 gap-2">
        <input placeholder="Property address" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" />

        <input placeholder="Estate agency" value={agentName} onChange={e => setAgentName(e.target.value)} className="p-2 border rounded" />

        <input placeholder="Branch" value={branchName} onChange={e => setBranchName(e.target.value)} className="p-2 border rounded" />

        <input placeholder="Property URL / Rightmove link" value={destinationUrl} onChange={e => setDestinationUrl(e.target.value)} className="p-2 border rounded" />

        <input placeholder="QR ID e.g. bromley-15-manor-road" value={slug} onChange={e => setSlug(e.target.value)} className="p-2 border rounded" />

        <button disabled={loading} className="mt-2 bg-indigo-600 text-white py-2 rounded">
          {loading ? 'Creating...' : 'Create QR'}
        </button>
      </div>
    </form>
  )
}