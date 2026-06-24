import { ReactNode } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-medium">Admin Dashboard</h2>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </header>
      {children}
    </div>
  )
}
