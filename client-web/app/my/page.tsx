'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Bell, User, Check, Plus, BarChart3, Trophy, Lock, ChevronRight, Music, Film, Drama, Palette, PartyPopper, Ticket, Heart, Users, Globe, Trash2, Star, LogOut } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import CategoryFilter from '@/components/CategoryFilter'
import { catalogItemsApi, likesApi, achievementsApi, usersApi, categoriesApi, stubsApi, followsApi, notificationsApi } from '@/lib/api'
import type { CatalogItem, Achievement, Category, Stub } from '@/lib/api/types'

const getCategoryIcon = (code?: string) => {
  const iconMap: Record<string, React.ElementType> = {
    MUSIC: Music,
    SPORTS: Trophy,
    CINEMA: Film,
    THEATER: Drama,
    EXHIBITION: Palette,
    FESTIVAL: PartyPopper,
  }
  const IconComponent = iconMap[code || ''] || Ticket
  return <IconComponent size={18} />
}

export default function MyPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('tickets')
  const [activeFilter, setActiveFilter] = useState('CINEMA')
  const [myStubs, setMyStubs] = useState<Stub[]>([])
  const [likedTickets, setLikedTickets] = useState<CatalogItem[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState({
    ticketCount: 0,
    followerCount: 120,
    followingCount: 238,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const userProfile = {
    nickname: session?.user?.name || '사용자',
    bio: '영화를 사랑하는 티켓 컬렉터',
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)

      const userId = Number(session?.user?.id)
      if (!userId) {
        throw new Error('User ID not found')
      }

      const [stubsData, likedData, achievementsData, categoriesData, followersData, followingData, unread] = await Promise.all([
        stubsApi.getMyStubs().catch(() => []),
        likesApi.getMyLikes().catch(() => []),
        achievementsApi.getAll(),
        categoriesApi.getAll(),
        followsApi.getFollowers(userId).catch(() => []),
        followsApi.getFollowing(userId).catch(() => []),
        notificationsApi.getUnreadCount().catch(() => 0),
      ])

      setMyStubs(stubsData)
      setLikedTickets(likedData)
      setAchievements(achievementsData)
      setCategories([
        { id: 0, code: 'ALL', name: '전체', icon: '', color: '', created_at: '' },
        ...categoriesData,
      ])
      setUnreadCount(unread)
      setStats({
        ticketCount: stubsData.length,
        followerCount: followersData.length,
        followingCount: followingData.length,
      })
    } catch (error) {
      console.error('Failed to load my page data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStubs =
    activeFilter === 'ALL'
      ? myStubs
      : myStubs.filter((s) => s.catalog_item?.category?.code === activeFilter)

  const earnedAchievements = achievements.filter((a) => a.achieved)
  const lockedAchievements = achievements.filter((a) => !a.achieved)

  // 세션 로딩 중
  if (status === 'loading') {
    return (
      <div className="app-container">
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ color: 'var(--txt-muted)' }}>로딩 중...</div>
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="app-container">
        <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>
          {/* Header */}
          <header className="app-header">
            <div className="logo">
              OT<span>BOOK</span>
            </div>
            <div className="header-actions">
              <div className="icon-btn" style={{ position: 'relative' }} onClick={() => router.push('/notifications')}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#e03a3a', border: '1.5px solid var(--bg)',
                  }} />
                )}
              </div>
            </div>
          </header>

          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-top">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  <User size={38} color="rgba(201,168,76,.7)" />
                </div>
                <div className="profile-badge">
                  <Check size={11} strokeWidth={3} color="#0a0800" />
                </div>
              </div>
              <div className="profile-info">
                <div className="profile-name">{userProfile.nickname}</div>
                <div className="profile-handle">{session?.user?.email || ''}</div>
                <div className="profile-bio">
                  {userProfile.bio}
                </div>
              </div>
            </div>

            <div className="stats-row" style={{ marginBottom: '14px' }}>
              <div className="stat-box">
                <div className="stat-value">{stats.ticketCount}</div>
                <div className="stat-label">티켓</div>
              </div>
              <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => router.push('/my/follows?tab=followers')}>
                <div className="stat-value">
                  {(stats.followerCount / 1000).toFixed(1)}K
                </div>
                <div className="stat-label">팔로워</div>
              </div>
              <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => router.push('/my/follows?tab=following')}>
                <div className="stat-value">{stats.followingCount}</div>
                <div className="stat-label">팔로잉</div>
              </div>
            </div>
          </div>

          {/* Collection Tabs */}
          <div className="collection-tabs">
            <div
              className={`col-tab ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              내 티켓
            </div>
            <div
              className={`col-tab ${activeTab === 'likes' ? 'active' : ''}`}
              onClick={() => setActiveTab('likes')}
            >
              좋아요
            </div>
            <div
              className={`col-tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              업적
            </div>
            <div
              className={`col-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              설정
            </div>
          </div>

          {/* Ad Banner Slot (always visible below tabs) */}
          <div id="banner-ad-slot" className="anim anim-d2">
            <span className="ad-placeholder-text">광고 연결 영역</span>
          </div>

          {/* Tab Panels */}
          {activeTab === 'tickets' && (
            <div className="col-panel active">
              {/* 카테고리 필터 - 현재 숨김 (영화 카테고리 고정) */}
              {/* <div className="my-filter-wrap">
                {categories.map((cat) => (
                  <div
                    key={cat.code}
                    className={`my-filter-tab ${activeFilter === cat.code ? 'active' : ''}`}
                    onClick={() => setActiveFilter(cat.code)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div> */}

              <div className="my-sort-row" style={{ paddingTop: '14px' }}>
                <span className="my-count">
                  티켓 <strong>{filteredStubs.length}</strong>장
                </span>
                <div className="my-sort-btn">최신순</div>
              </div>

              <div className="my-ticket-grid">
                {filteredStubs.map((stub, index) => (
                  <StubCard
                    key={stub.id}
                    stub={stub}
                    number={String(index + 1).padStart(3, '0')}
                    onClick={() => {
                      if (stub.catalog_item?.catalog_group_id) {
                        router.push(`/catalog/${stub.catalog_item.catalog_group_id}`)
                      }
                    }}
                  />
                ))}
                <div className="tg-add" onClick={() => router.push('/catalog')}>
                  <div className="tg-add-icon">
                    <Plus size={28} />
                  </div>
                  <div className="tg-add-lbl">티켓 추가</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="col-panel active">
              <div className="my-sort-row" style={{ paddingTop: '14px' }}>
                <span className="my-count">
                  좋아요 <strong>{likedTickets.length}</strong>장
                </span>
                <div className="my-sort-btn">최신순</div>
              </div>

              <div className="my-ticket-grid">
                {likedTickets.map((ticket, index) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    number={String(index + 1).padStart(3, '0')}
                    onClick={() => router.push(`/catalog/${ticket.catalog_group_id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="col-panel active">
              <div className="section-header" style={{ marginTop: '16px' }}>
                <div className="section-title">
                  <Trophy size={16} color="var(--gold)" style={{ marginRight: '4px' }} />
                  획득한 업적
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'DM Mono',monospace",
                    color: 'var(--gold)',
                    letterSpacing: '.04em',
                  }}
                >
                  {earnedAchievements.length} / {achievements.length}
                </span>
              </div>
              <div className="achievement-grid">
                {earnedAchievements.map((achievement) => (
                  <AchievementItem key={achievement.code} achievement={achievement} />
                ))}
              </div>

              <div className="section-header" style={{ marginTop: '16px' }}>
                <div className="section-title">
                  <Lock size={16} color="var(--txt-muted)" style={{ marginRight: '4px' }} />
                  잠긴 업적
                </div>
              </div>
              <div className="achievement-grid" style={{ paddingBottom: '16px' }}>
                {lockedAchievements.map((achievement) => (
                  <AchievementItem key={achievement.code} achievement={achievement} locked />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="col-panel active">
              <SettingsPanel onDeleteAccount={() => setShowDeleteModal(true)} />
            </div>
          )}
        </main>
        <Navigation />
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={async () => {
            const userId = Number(session?.user?.id)
            if (!userId) throw new Error('유저 정보를 찾을 수 없어요')

            // 1. 백엔드 계정 삭제
            await usersApi.delete(userId)

            // 2. 로컬 스토리지 / 세션 스토리지 / 쿠키 전부 클리어
            if (typeof window !== 'undefined') {
              localStorage.clear()
              sessionStorage.clear()
              document.cookie.split(';').forEach(c => {
                document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/'
              })
            }

            // 3. NextAuth 세션 종료 → 로그인 페이지로 (Google 자동 재로그인 차단)
            await signOut({ redirect: false })
            window.location.href = '/login?deleted=true'
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

// ─── StubCard (내 티켓 탭 - stubs 기반) ──────────────────────────────────────

interface StubCardProps {
  stub: Stub
  number: string
  onClick: () => void
}

function StubCard({ stub, number, onClick }: StubCardProps) {
  const ticket = stub.catalog_item
  const categoryCode = ticket?.category?.code

  const getCategoryColor = (code?: string): string => {
    const colorMap: Record<string, string> = {
      MUSIC: 'c-purple', SPORTS: 'c-red', THEATER: 'c-teal',
      EXHIBITION: 'c-amber', CINEMA: 'c-navy', FESTIVAL: 'c-rose',
    }
    return colorMap[code || ''] || 'c-purple'
  }

  const getGlowColor = (code?: string): string => {
    const glowMap: Record<string, string> = {
      MUSIC: '#7b2ff7', SPORTS: '#e03a3a', THEATER: '#00c8b0',
      EXHIBITION: '#c9a84c', CINEMA: '#2a4c9f', FESTIVAL: '#e74c78',
    }
    return glowMap[code || ''] || '#7b2ff7'
  }

  const displayName = (() => {
    const title = ticket?.title || ''
    const match = title.match(/^OGT No\.\d+\s+(.+)\s+티켓$/)
    return match ? match[1] : title
  })()

  const grade = (ticket?.metadata?.metadata as Record<string, any>)?.section || 'VIP'
  const imageUrl = stub.image_url || ticket?.image_url

  return (
    <div className={`tg-card tg-collected ${getCategoryColor(categoryCode)}`} onClick={onClick}>
      <div className="tg-inner">
        {imageUrl ? (
          <img className="tg-image" src={imageUrl} alt={displayName} style={{ opacity: 0.85 }} />
        ) : (
          <div className="tg-glow" style={{ background: getGlowColor(categoryCode) }} />
        )}
        <div className="tg-num">#{number}</div>
        {!imageUrl && (
          <div className="tg-emoji-wrap">
            <span className="tg-emoji">{getCategoryIcon(categoryCode)}</span>
          </div>
        )}
        <div className="tg-name">{displayName || '알 수 없는 티켓'}</div>
        <div className="tg-date">
          {new Date(stub.created_at).toLocaleDateString('ko-KR')}
        </div>
      </div>
      <div className="tg-grade">{grade}</div>
      <div className="tg-owned-badge">
        <Check size={10} strokeWidth={3} color="#0a0800" />
      </div>
    </div>
  )
}

// ─── TicketCard (좋아요 탭 - catalog_items 기반) ──────────────────────────────

interface TicketCardProps {
  ticket: CatalogItem
  number: string
  onClick: () => void
}

function TicketCard({ ticket, number, onClick }: TicketCardProps) {
  const getCategoryColor = (code?: string): string => {
    const colorMap: Record<string, string> = {
      MUSIC: 'c-purple',
      SPORTS: 'c-red',
      THEATER: 'c-teal',
      EXHIBITION: 'c-amber',
      CINEMA: 'c-navy',
      FESTIVAL: 'c-rose',
    }
    return colorMap[code || ''] || 'c-purple'
  }

  const getGlowColor = (code?: string): string => {
    const glowMap: Record<string, string> = {
      MUSIC: '#7b2ff7',
      SPORTS: '#e03a3a',
      THEATER: '#00c8b0',
      EXHIBITION: '#c9a84c',
      CINEMA: '#2a4c9f',
      FESTIVAL: '#e74c78',
    }
    return glowMap[code || ''] || '#7b2ff7'
  }

  const grade = ticket.metadata?.metadata?.section || 'VIP'

  // OGT No.XXX 형태에서 영화 제목만 추출, 없으면 원래 title 사용
  const displayName = (() => {
    const match = ticket.title?.match(/^OGT No\.\d+\s+(.+)\s+티켓$/)
    return match ? match[1] : ticket.title
  })()

  // 카드 컬러 (catalog_group color → ticket color 우선)
  const cardColor = ticket.color || ticket.catalog_group?.color

  return (
    <div
      className={`tg-card tg-collected ${getCategoryColor(ticket.category?.code)}`}
      onClick={onClick}
      style={cardColor ? { borderColor: `${cardColor}55` } : undefined}
    >
      <div className="tg-inner">
        {ticket.image_url && (
          <img
            className="tg-image"
            src={ticket.image_url}
            alt={displayName}
            style={{ opacity: 0.85 }}
          />
        )}

        {!ticket.image_url && (
          <div className="tg-glow" style={{ background: getGlowColor(ticket.category?.code) }} />
        )}

        <div className="tg-num">#{number}</div>

        {!ticket.image_url && (
          <div className="tg-emoji-wrap">
            <span className="tg-emoji">{getCategoryIcon(ticket.category?.code)}</span>
          </div>
        )}

        <div className="tg-name">{displayName}</div>
        <div className="tg-date">{new Date(ticket.created_at).toLocaleDateString('ko-KR')}</div>
      </div>
      <div className="tg-grade">{grade}</div>
      <div className="tg-owned-badge">
        <Check size={10} strokeWidth={3} color="#0a0800" />
      </div>
    </div>
  )
}

interface AchievementItemProps {
  achievement: Achievement
  locked?: boolean
}

function AchievementItem({ achievement, locked }: AchievementItemProps) {
  const getCategoryColor = (icon: string): string => {
    const colorMap: Record<string, string> = {
      ticket: 'c-amber',
      trophy: 'c-red',
      star: 'c-teal',
      flame: 'c-amber',
    }
    return colorMap[icon] || 'c-purple'
  }

  const IconComponent = achievement.icon === 'trophy' ? Trophy : Star

  return (
    <div className="achievement-item">
      <div className={`achievement-icon ${getCategoryColor(achievement.icon)} ${locked ? 'locked' : ''}`}>
        <IconComponent size={20} />
      </div>
      <div className={`achievement-name ${!locked ? 'earned' : ''}`}>{achievement.name}</div>
    </div>
  )
}

interface SettingsPanelProps {
  onDeleteAccount: () => void
}

function SettingsPanel({ onDeleteAccount }: SettingsPanelProps) {
  const router = useRouter()
  const [pushNotif, setPushNotif] = useState(true)
  const [likeNotif, setLikeNotif] = useState(true)
  const [followerNotif, setFollowerNotif] = useState(false)

  return (
    <>
      <div className="settings-section">
        <div className="settings-title">계정</div>
        <div className="settings-item" onClick={() => router.push('/my/edit')}>
          <div className="settings-icon" style={{ background: 'rgba(122,32,247,.18)' }}>
            <User size={18} />
          </div>
          <div className="settings-label">프로필 편집</div>
          <div className="settings-arrow">
            <ChevronRight size={20} />
          </div>
        </div>
        <div className="settings-item" onClick={() => alert('계정 공개 설정')}>
          <div className="settings-icon" style={{ background: 'rgba(201,168,76,.18)' }}>
            <Lock size={18} />
          </div>
          <div className="settings-label">계정 공개 설정</div>
          <div className="settings-value">공개</div>
          <div className="settings-arrow">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">알림</div>
        <div className="settings-item">
          <div className="settings-icon" style={{ background: 'rgba(201,168,76,.2)' }}>
            <Bell size={18} />
          </div>
          <div className="settings-label">푸시 알림</div>
          <div
            className={`toggle ${pushNotif ? 'on' : ''}`}
            onClick={() => setPushNotif(!pushNotif)}
          />
        </div>
        <div className="settings-item">
          <div className="settings-icon" style={{ background: 'rgba(224,58,58,.15)' }}>
            <Heart size={18} />
          </div>
          <div className="settings-label">좋아요 알림</div>
          <div
            className={`toggle ${likeNotif ? 'on' : ''}`}
            onClick={() => setLikeNotif(!likeNotif)}
          />
        </div>
        <div className="settings-item">
          <div className="settings-icon" style={{ background: 'rgba(68,136,255,.15)' }}>
            <Users size={18} />
          </div>
          <div className="settings-label">팔로워 알림</div>
          <div
            className={`toggle ${followerNotif ? 'on' : ''}`}
            onClick={() => setFollowerNotif(!followerNotif)}
          />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">앱 설정</div>
        <div className="settings-item" onClick={() => alert('언어 설정')}>
          <div className="settings-icon" style={{ background: 'rgba(122,32,247,.15)' }}>
            <Globe size={18} />
          </div>
          <div className="settings-label">언어</div>
          <div className="settings-value">한국어</div>
          <div className="settings-arrow">
            <ChevronRight size={20} />
          </div>
        </div>
        <div className="settings-item" onClick={onDeleteAccount}>
          <div className="settings-icon" style={{ background: 'rgba(224,58,58,.15)' }}>
            <Trash2 size={18} />
          </div>
          <div className="settings-label" style={{ color: 'var(--red)' }}>
            계정 탈퇴
          </div>
          <div className="settings-arrow" style={{ color: 'var(--red)' }}>
            <ChevronRight size={20} />
          </div>
        </div>
        <div
          className="settings-item"
          onClick={() => {
            signOut({ callbackUrl: '/login' })
          }}
        >
          <div className="settings-icon" style={{ background: 'rgba(224,58,58,.15)' }}>
            <LogOut size={18} />
          </div>
          <div className="settings-label" style={{ color: 'var(--red)' }}>
            로그아웃
          </div>
          <div className="settings-arrow" style={{ color: 'var(--red)' }}>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 16px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '11px',
            fontFamily: "'DM Mono',monospace",
            color: 'var(--txt-muted)',
            letterSpacing: '.06em',
          }}
        >
          OTBOOK v1.0.0
        </div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: "'DM Mono',monospace",
            color: 'var(--txt-muted)',
            marginTop: '3px',
            letterSpacing: '.04em',
          }}
        >
          수집가들을 위한 오리지널 티켓 앱
        </div>
      </div>
    </>
  )
}

interface DeleteAccountModalProps {
  onConfirm: () => Promise<void>
  onClose: () => void
}

function DeleteAccountModal({ onConfirm, onClose }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== '탈퇴') {
      return
    }

    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('계정 탈퇴에 실패했습니다. 다시 시도해주세요.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--red)' }}>
            계정 탈퇴
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <Trash2 size={48} color="var(--red)" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '15px', color: 'var(--txt)', marginBottom: '12px', fontWeight: '600' }}>
              정말 탈퇴하시겠습니까?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--txt-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며,
              <br />
              복구할 수 없습니다.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              탈퇴를 진행하려면 "<strong>탈퇴</strong>"를 입력하세요
            </label>
            <input
              type="text"
              className="form-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="탈퇴"
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={confirmText !== '탈퇴' || isDeleting}
          >
            {isDeleting ? '탈퇴 처리 중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
