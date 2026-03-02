'use client'

import { SessionProvider } from 'next-auth/react'
import { AppSettingsProvider } from '@/lib/contexts/AppSettingsContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppSettingsProvider>
        {children}
      </AppSettingsProvider>
    </SessionProvider>
  )
}
