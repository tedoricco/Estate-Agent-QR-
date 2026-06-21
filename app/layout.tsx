import '../styles/globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Estate Agent QR - Admin',
  description: 'Admin-managed QR boards'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
