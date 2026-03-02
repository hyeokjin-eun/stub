'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { appSettingsApi } from '@/lib/api/appSettings'
import type { AppSettings } from '@/lib/api/types'

interface AppSettingsContextType {
  settings: AppSettings | null
  loading: boolean
  adsEnabled: boolean
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: null,
  loading: true,
  adsEnabled: true, // 기본값
})

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await appSettingsApi.getSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to load app settings:', error)
        // 실패 시 기본값 사용
        setSettings({
          id: 1,
          app_title: 'STUB',
          app_subtitle: null,
          app_description: null,
          ads_enabled: true,
          created_at: '',
          updated_at: '',
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        adsEnabled: settings?.ads_enabled ?? true,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  return useContext(AppSettingsContext)
}
