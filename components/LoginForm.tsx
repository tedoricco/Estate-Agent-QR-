'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../lib/supabaseClient'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/admin/dashboard')
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow">
      <label className="block mb-2">Email</label>
      <input className="w-full mb-4 p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
      <label className="block mb-2">Password</label>
      <input type="password" className="w-full mb-4 p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded">{loading ? 'Signing in...' : 'Sign in'}</button>
    </form>
  )
}
