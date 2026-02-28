'use client'

import { useEffect } from 'react'
import { appSettingsApi } from '@/lib/api'

interface DynamicTitleProps {
  pageName?: string
}

export default function DynamicTitle({ pageName }: DynamicTitleProps) {
  useEffect(() => {
    const updateTitle = async () => {
      try {
        const settings = await appSettingsApi.getSettings()
        const appTitle = settings.app_title || 'STUB'
        const fullTitle = pageName ? `${pageName} - ${appTitle}BOOK` : `${appTitle}BOOK`
        document.title = fullTitle
      } catch (error) {
        console.error('Failed to load app settings for title:', error)
        const fallbackTitle = pageName ? `${pageName} - STUBBOOK` : 'STUBBOOK'
        document.title = fallbackTitle
      }
    }

    updateTitle()
  }, [pageName])

  return null
}
