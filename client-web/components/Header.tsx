'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'
import { notificationsApi, appSettingsApi } from '@/lib/api'

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [appTitle, setAppTitle] = useState('STUB')

  useEffect(() => {
    loadAppSettings()
    if (session?.user) {
      loadUnreadCount()
    }
  }, [session])

  const loadAppSettings = async () => {
    try {
      const settings = await appSettingsApi.getSettings()
      setAppTitle(settings.app_title || 'STUB')
    } catch (error) {
      console.error('Failed to load app settings:', error)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  return (
    <header className="app-header">
      <div className="logo">
        {appTitle}<span>BOOK</span>
      </div>
      <div className="header-actions">
        <button
          className="icon-btn"
          aria-label="알림"
          onClick={() => router.push('/notifications')}
          style={{ position: 'relative' }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 8, height: 8, borderRadius: '50%',
              background: '#e03a3a', border: '1.5px solid var(--bg)',
            }} />
          )}
        </button>
      </div>
    </header>
  )
}
