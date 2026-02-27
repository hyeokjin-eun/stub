'use client'

import { Bell } from 'lucide-react'

export default function Header() {
  return (
    <header className="app-header">
      <div className="logo">
        OT<span>BOOK</span>
      </div>
      <div className="header-actions">
        <button className="icon-btn" aria-label="알림">
          <Bell size={20} />
        </button>
      </div>
    </header>
  )
}
