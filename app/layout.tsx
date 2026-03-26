import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oklo Market Intelligence',
  description: 'US nuclear market analysis dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
