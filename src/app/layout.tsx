import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oklo Market Intelligence',
  description: 'Nuclear market analysis and site prospecting platform for Oklo strategy team',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ height: '100vh', overflow: 'hidden' }}>{children}</body>
    </html>
  )
}
