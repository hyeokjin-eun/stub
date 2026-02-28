import type { Metadata, Viewport } from 'next'
import './globals.css'
import ShellWrapper from '@/components/ShellWrapper'

export const metadata: Metadata = {
  title: 'OTBOOK Admin',
  description: 'OTBOOK 관리자 콘솔',
  robots: 'noindex',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ShellWrapper>{children}</ShellWrapper>
      </body>
    </html>
  )
}
