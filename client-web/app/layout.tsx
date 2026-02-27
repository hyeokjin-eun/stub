'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Providers from '@/components/Providers'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const showNavigation = pathname !== '/login' && pathname !== '/onboarding'

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>OTBOOK</title>
        <meta name="description" content="수집가들을 위한 오리지널 티켓 컬렉션 앱" />
      </head>
      <body>
        <Providers>
          <div className="app-container">
            <main className="main-content">{children}</main>
            {showNavigation && <Navigation />}
          </div>
        </Providers>
      </body>
    </html>
  )
}
