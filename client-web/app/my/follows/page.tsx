'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, UserCheck, UserPlus, User as UserIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { followsApi } from '@/lib/api'
import type { User } from '@/lib/api/types'
import { Suspense } from 'react'

function FollowsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const initialTab = (searchParams.get('tab') as 'followers' | 'following') || 'followers'
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab)
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({})

  const userId = Number(session?.user?.id)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      followsApi.getFollowers(userId).catch(() => []),
      followsApi.getFollowing(userId).catch(() => []),
    ]).then(([frs, fing]) => {
      setFollowers(frs)
      setFollowing(fing)
      // 내가 팔로잉 중인 유저 맵
      const map: Record<number, boolean> = {}
      fing.forEach(u => { map[u.id] = true })
      setFollowingMap(map)
    }).finally(() => setLoading(false))
  }, [userId])

  const handleToggleFollow = async (targetId: number) => {
    const res = await followsApi.toggle(targetId).catch(() => null)
    if (!res) return
    setFollowingMap(prev => ({ ...prev, [targetId]: res.following }))
  }

  const list = tab === 'followers' ? followers : following

  return (
    <div className="app-container">
      <main className="main-content" style={{ paddingBottom: 24 }}>

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
            {tab === 'followers' ? '팔로워' : '팔로잉'}
          </div>
        </div>

        {/* 탭 */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 49, zIndex: 9, background: 'var(--bg)',
        }}>
          {(['followers', 'following'] as const).map(t => (
            <div
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, textAlign: 'center', padding: '12px 0',
                fontSize: 14, fontWeight: tab === t ? 700 : 400,
                color: tab === t ? 'var(--txt)' : 'var(--txt-muted)',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {t === 'followers' ? '팔로워' : '팔로잉'}
            </div>
          ))}
        </div>

        {/* 목록 */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--txt-muted)' }}>로딩 중...</div>
        ) : list.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            <UserIcon size={48} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 4 }}>
              {tab === 'followers' ? '아직 팔로워가 없어요' : '팔로잉 중인 유저가 없어요'}
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {list.map(user => (
              <UserRow
                key={user.id}
                user={user}
                isMe={user.id === userId}
                isFollowing={!!followingMap[user.id]}
                onToggle={() => handleToggleFollow(user.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function UserRow({ user, isMe, isFollowing, onToggle }: {
  user: User
  isMe: boolean
  isFollowing: boolean
  onToggle: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* 아바타 */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: 'var(--card)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {user.avatar_url
          ? <img src={user.avatar_url} alt={user.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <UserIcon size={22} strokeWidth={1.4} color="var(--txt-muted)" />
        }
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>
          {user.nickname || '알 수 없음'}
        </div>
        {user.bio && (
          <div style={{ fontSize: 12, color: 'var(--txt-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.bio}
          </div>
        )}
      </div>

      {/* 팔로우 버튼 (본인 제외) */}
      {!isMe && (
        <button
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all .2s', border: 'none',
            background: isFollowing ? 'var(--card)' : 'var(--gold)',
            color: isFollowing ? 'var(--txt-muted)' : '#0a0800',
            outline: isFollowing ? '1px solid var(--border)' : 'none',
          }}
        >
          {isFollowing
            ? <><UserCheck size={13} /> 팔로잉</>
            : <><UserPlus size={13} /> 팔로우</>
          }
        </button>
      )}
    </div>
  )
}

export default function FollowsPage() {
  return (
    <Suspense fallback={null}>
      <FollowsContent />
    </Suspense>
  )
}
