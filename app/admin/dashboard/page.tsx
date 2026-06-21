'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabaseClient'
import BoardTable from '../../../components/BoardTable'
import BoardForm from '../../../components/BoardForm'

type Board = {
  id: string
  name: string
  agent_name?: string
  branch_name?: string
  destination_url: string
  slug: string
  scan_count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const s = await supabase.auth.getSession()
      if (!s?.data?.session) {
        router.push('/admin/login')
        return
      }
      await loadBoards(s.data.session.access_token)
    }
    check()
  }, [])

  async function loadBoards(token?: string) {
    setLoading(true)
    const res = await fetch('/api/boards', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setBoards(data)
    } else {
      console.error('Failed to fetch')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <BoardForm onCreated={() => supabase.auth.getSession().then(s => loadBoards(s.data?.session?.access_token))} />
      </div>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <BoardTable boards={boards} onChange={() => supabase.auth.getSession().then(s => loadBoards(s.data?.session?.access_token))} />
        )}
      </div>
    </div>
  )
}
