'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Heart, UserPlus, MessageCircle, Megaphone, Trash2, CheckCheck } from 'lucide-react'
import { notificationsApi } from '@/lib/api'
import type { NotificationItem, NotificationType } from '@/lib/api'
import Navigation from '@/components/Navigation'
import DynamicTitle from '@/components/DynamicTitle'

// ─── 알림 타입별 아이콘/색상 ───────────────────────────────────────────────────

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  LIKE_COLLECTION: { icon: <Heart size={16} />, color: '#e03a3a' },
  LIKE_TICKET:     { icon: <Heart size={16} />, color: '#e03a3a' },
  FOLLOW:          { icon: <UserPlus size={16} />, color: '#7b2ff7' },
  COMMENT:         { icon: <MessageCircle size={16} />, color: '#00c8b0' },
  MENTION:         { icon: <MessageCircle size={16} />, color: '#00c8b0' },
  SYSTEM:          { icon: <Megaphone size={16} />, color: '#c9a84c' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()
  const [items, setItems]     = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread]   = useState(0)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const { data, unread } = await notificationsApi.getAll(1, 50)
      setItems(data)
      setUnread(unread)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      await notificationsApi.markRead(item.id).catch(() => null)
      setItems(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    }
    if (item.target_url) router.push(item.target_url)
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await notificationsApi.remove(id).catch(() => null)
    setItems(prev => prev.filter(n => n.id !== id))
  }

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => null)
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <>
      <DynamicTitle pageName="알림" />
      <div className="app-container">
        <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>

        {/* TopBar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', color: 'var(--txt)', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, zIndex: 1 }}
            onClick={() => router.back()}
          >
            <ChevronLeft size={20} />
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--txt)',
            pointerEvents: 'none',
          }}>
            알림
            {unread > 0 && (
              <span style={{
                marginLeft: 6, fontSize: 11, fontFamily: 'DM Mono',
                background: '#e03a3a', color: '#fff',
                borderRadius: 10, padding: '1px 6px',
              }}>{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <div
              style={{ marginLeft: 'auto', zIndex: 1, cursor: 'pointer', padding: '6px 8px' }}
              onClick={handleMarkAllRead}
              title="모두 읽음"
            >
              <CheckCheck size={18} color="var(--txt-muted)" />
            </div>
          )}
        </div>

        {/* 목록 */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--txt-muted)' }}>로딩 중...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <Bell size={48} strokeWidth={1.2} color="var(--txt-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 4 }}>알림이 없어요</div>
            <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>새로운 소식이 생기면 여기서 확인할 수 있어요</div>
          </div>
        ) : (
          <div>
            {items.map(item => (
              <NotifRow
                key={item.id}
                item={item}
                onClick={() => handleClick(item)}
                onDelete={(e) => handleDelete(e, item.id)}
              />
            ))}
          </div>
        )}
        </main>
        <Navigation />
      </div>
    </>
  )
}

// ─── NotifRow ────────────────────────────────────────────────────────────────

function NotifRow({ item, onClick, onDelete }: {
  item: NotificationItem
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.SYSTEM

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: item.is_read ? 'transparent' : 'rgba(201,168,76,.05)',
        cursor: item.target_url ? 'pointer' : 'default',
        transition: 'background .15s',
        position: 'relative',
      }}
    >
      {/* 읽지 않음 인디케이터 */}
      {!item.is_read && (
        <div style={{
          position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
          width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)',
        }} />
      )}

      {/* 아이콘 */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: `${meta.color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: meta.color,
      }}>
        {item.actor?.avatar_url ? (
          <img src={item.actor.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : meta.icon}
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--txt)', lineHeight: 1.5, marginBottom: 3 }}>
          {item.message}
        </div>
        <div style={{ fontSize: 11, color: 'var(--txt-muted)', fontFamily: 'DM Mono' }}>
          {timeAgo(item.created_at)}
        </div>
      </div>

      {/* 삭제 버튼 */}
      <div
        onClick={onDelete}
        style={{ padding: 4, color: 'var(--txt-muted)', opacity: 0.5, cursor: 'pointer', flexShrink: 0 }}
      >
        <Trash2 size={14} />
      </div>
    </div>
  )
}
