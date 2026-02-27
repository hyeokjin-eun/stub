'use client'

import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Ticket, Users, Megaphone, Image } from 'lucide-react'

const NAV = [
  { href: '/',         icon: LayoutDashboard, label: '대시보드' },
  { href: '/tickets',  icon: Ticket,          label: '티켓' },
  { href: '/users',    icon: Users,           label: '유저' },
  { href: '/banners',  icon: Image,           label: '배너' },
  { href: '/notify',   icon: Megaphone,       label: '공지' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="admin-nav">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <div key={href} className={`admin-nav-item ${active ? 'active' : ''}`} onClick={() => router.push(href)}>
            <Icon size={20} />
            <span>{label}</span>
          </div>
        )
      })}
    </nav>
  )
}
