'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, FolderHeart, User } from 'lucide-react'

const navItems = [
  { href: '/collection', icon: FolderHeart, label: '컬렉션' },
  { href: '/', icon: Home, label: '홈' },
  { href: '/catalog', icon: BookOpen, label: '카탈로그' },
  { href: '/my', icon: User, label: '마이' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon size={20} />
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
