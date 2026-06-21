import Link from 'next/link'

export default function Home() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-4xl font-semibold mb-4">Estate Agent QR — Admin MVP</h1>
      <p className="text-lg text-slate-600 mb-8">Admin-managed QR boards for estate agents.</p>
      <div className="flex justify-center gap-4">
        <Link href="/admin/login" className="px-4 py-2 bg-indigo-600 text-white rounded">Admin Login</Link>
      </div>
    </div>
  )
}
