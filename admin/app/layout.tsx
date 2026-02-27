import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OTBOOK Admin',
  description: 'OTBOOK 관리자 대시보드',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
