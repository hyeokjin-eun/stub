'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ChevronLeft,
  Share2,
  Heart,
  Plus,
  ChevronRight,
  Lock,
  Check,
  Download,
  Loader2,
  Music,
  Trophy,
  Film,
  Drama,
  Palette,
  PartyPopper,
  Ticket,
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import { catalogGroupsApi, catalogItemsApi, stubsApi, likesApi } from '@/lib/api'
import type { CatalogGroup, CatalogItem, Stub } from '@/lib/api/types'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'

const PAGE_SIZE = 6

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
  return <IconComponent size={48} />
}

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

// OGT No.XXX 제목에서 영화명만 추출
const parseTitle = (title: string) => {
  const match = title?.match(/^OGT No\.\d+\s+(.+)\s+티켓$/)
  return match ? match[1] : title
}

export default function CatalogDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const { adsEnabled } = useAppSettings()
  const groupId = Number(params.id)

  const [group, setGroup] = useState<CatalogGroup | null>(null)
  const [tickets, setTickets] = useState<CatalogItem[]>([])
  // catalog_item_id → stub_id 맵 (보유 여부 표시용)
  const [ownedMap, setOwnedMap] = useState<Record<number, number>>({})
  const [activeTab, setActiveTab] = useState<'all' | 'collected' | 'missing'>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<CatalogItem | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [groupData, itemsData, ownedMapData] = await Promise.all([
        catalogGroupsApi.getById(groupId),
        catalogItemsApi.getAll({ catalog_group_id: groupId, limit: 200 }),
        stubsApi.getOwnedMapByGroup(groupId).catch(() => ({})), // 비로그인시 빈 맵
      ])
      setGroup(groupData)
      setTickets(itemsData.data)
      setOwnedMap(ownedMapData)
    } catch (error) {
      console.error('Failed to load catalog detail:', error)
      router.push('/catalog')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 보유 등록 / 해제 후 ownedMap 갱신
  const handleToggleOwned = async (catalogItemId: number) => {
    // 로그인 체크
    if (!session) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const existingStubId = ownedMap[catalogItemId]
    if (existingStubId) {
      // 보유 해제
      await stubsApi.remove(existingStubId)
      setOwnedMap((prev) => {
        const next = { ...prev }
        delete next[catalogItemId]
        return next
      })
    } else {
      // 보유 등록
      const stub = await stubsApi.create({ catalog_item_id: catalogItemId, status: 'collected' })
      setOwnedMap((prev) => ({ ...prev, [catalogItemId]: stub.id }))
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'collected') return ownedMap[t.id] !== undefined
    if (activeTab === 'missing') return ownedMap[t.id] === undefined
    return true
  })

  const collectedCount = Object.keys(ownedMap).length

  const pageCount = Math.ceil(filteredTickets.length / PAGE_SIZE)
  const currentTickets = filteredTickets.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  // 2열 기준 짝수 맞추기 (6개 고정 아닌 마지막 페이지 홀수 처리)
  const paddedTickets: (CatalogItem | null)[] = [...currentTickets]
  if (paddedTickets.length % 2 !== 0 && filteredTickets.length > 0) {
    paddedTickets.push(null)
  }

  const goToPage = (page: number) => {
    if (isAnimating || page < 0 || page >= pageCount || page === currentPage) return
    setIsAnimating(true)
    setCurrentPage(page)
    setTimeout(() => setIsAnimating(false), 380)
  }

  const changeTab = (tab: 'all' | 'collected' | 'missing') => {
    setActiveTab(tab)
    setCurrentPage(0)
  }

  if (loading || !group) {
    return (
      <div className="app-container">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="app-container">
        <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>
          {/* Top Bar */}
          <div className="detail-topbar">
            <div className="icon-btn" onClick={() => router.back()}>
              <ChevronLeft size={20} />
            </div>
            <div className="header-actions">
              <div className="icon-btn" onClick={() => alert('공유')}>
                <Share2 size={18} />
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className={`detail-hero ${getCategoryColor(group.category?.code)}`}>
            <div className="hero-bg">
              {group.thumbnail_url ? (
                <img
                  src={group.thumbnail_url}
                  alt={group.name}
                  className="hero-thumbnail"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <>
                  <div className="hero-glow-big" style={{ background: getGlowColor(group.category?.code) }} />
                  <div className="hero-emoji">{getCategoryIcon(group.category?.code)}</div>
                </>
              )}
            </div>
            <div className="hero-overlay" />
            <div className="hero-perf" />
            <div className="hero-content">
              <div className="hero-cat">{group.category?.code || 'OTHER'}</div>
              <div className="hero-title">{group.name}</div>
              <div className="hero-sub">
                {group.description || ''} · {tickets.length}종
              </div>
            </div>
          </div>

          <div className="content">
            {/* Meta Strip */}
            <div className="detail-meta-strip">
              <div className="dms-item">
                <div className="dms-val">{tickets.length}</div>
                <div className="dms-lbl">전체 수집품</div>
              </div>
              <div className="dms-item">
                <div className="dms-val" style={{ color: collectedCount > 0 ? 'var(--gold)' : undefined }}>
                  {collectedCount}
                </div>
                <div className="dms-lbl">수집 완료</div>
              </div>
              <div className="dms-item">
                <div className="dms-val">{tickets.length - collectedCount}</div>
                <div className="dms-lbl">미수집</div>
              </div>
              <div className="dms-item">
                <div className="dms-val">
                  {tickets.length > 0 ? Math.round((collectedCount / tickets.length) * 100) : 0}%
                </div>
                <div className="dms-lbl">달성률</div>
              </div>
            </div>

            {/* Ad Banner Slot */}
            {adsEnabled && (
              <div id="banner-ad-slot" className="anim anim-d2" style={{ marginTop: '14px' }}>
                <span className="ad-placeholder-text">광고 연결 영역</span>
              </div>
            )}

            {/* Ticket Tabs */}
            <div className="ticket-tabs">
              <div
                className={`ticket-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => changeTab('all')}
              >
                전체 {tickets.length}
              </div>
              <div
                className={`ticket-tab ${activeTab === 'collected' ? 'active' : ''}`}
                onClick={() => changeTab('collected')}
              >
                수집완료 {collectedCount}
              </div>
              <div
                className={`ticket-tab ${activeTab === 'missing' ? 'active' : ''}`}
                onClick={() => changeTab('missing')}
              >
                미수집 {tickets.length - collectedCount}
              </div>
            </div>

            {/* Pager Controls - 레이아웃 시프트 방지를 위해 항상 영역 확보 */}
            <div className="pager-controls" style={{ visibility: pageCount > 0 ? 'visible' : 'hidden' }}>
              <div
                className="pager-btn"
                style={{ opacity: currentPage === 0 ? 0.25 : 1 }}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft size={14} />
              </div>
              <div className="pager-dots">
                {Array.from({ length: Math.min(pageCount || 1, 10) }).map((_, i) => (
                  <div
                    key={i}
                    className={`pager-dot ${i === currentPage ? 'active' : ''}`}
                    onClick={() => goToPage(i)}
                  />
                ))}
              </div>
              <span className="page-label">
                {currentPage + 1} / {pageCount || 1}
              </span>
              <div
                className="pager-btn"
                style={{ opacity: currentPage >= pageCount - 1 ? 0.25 : 1 }}
                onClick={() => goToPage(currentPage + 1)}
              >
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Ticket Grid */}
            <div className="ticket-pager">
              <div className="ticket-grid">
                {filteredTickets.length === 0 ? (
                  <div className="tg-empty">
                    <div className="tg-empty-icon">📁</div>
                  <div className="tg-empty-txt">수집품이 없습니다</div>
                  </div>
                ) : (
                  paddedTickets.map((ticket, index) =>
                    ticket ? (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        group={group}
                        isOwned={ownedMap[ticket.id] !== undefined}
                        onClick={() => setSelectedTicket(ticket)}
                      />
                    ) : (
                      <div key={`empty-${index}`} className="tg-card tg-empty-slot" />
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </main>
        <Navigation />
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          group={group}
          isOwned={ownedMap[selectedTicket.id] !== undefined}
          stubId={ownedMap[selectedTicket.id]}
          onToggleOwned={() => handleToggleOwned(selectedTicket.id)}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  )
}

// ─── TicketCard ────────────────────────────────────────────────────────────────

interface TicketCardProps {
  ticket: CatalogItem
  group: CatalogGroup
  isOwned: boolean
  onClick: () => void
}

function TicketCard({ ticket, group, isOwned, onClick }: TicketCardProps) {
  const grade = ticket.metadata?.metadata?.section || 'VIP'
  const displayName = parseTitle(ticket.title)

  return (
    <div
      className={`tg-card ${isOwned ? 'tg-collected' : 'tg-locked'} ${getCategoryColor(group.category?.code)}`}
      onClick={onClick}
    >
      <div className="tg-inner">
        {ticket.image_url ? (
          ticket.image_url.endsWith('.mp4') ? (
            <video
              src={ticket.image_url}
              className="tg-image"
              style={{ opacity: isOwned ? 0.85 : 0.4, objectFit: 'cover' }}
              autoPlay loop muted playsInline
            />
          ) : (
            <img
              src={ticket.image_url}
              alt={displayName}
              className="tg-image"
              style={{ opacity: isOwned ? 0.85 : 0.4 }}
            />
          )
        ) : (
          <>
            <div className="tg-glow" style={{ background: getGlowColor(group.category?.code), opacity: isOwned ? 0.38 : 0.15 }} />
            <div className="tg-emoji-wrap">
              <span className="tg-emoji" style={{ opacity: isOwned ? 1 : 0.35 }}>
                {getCategoryIcon(group.category?.code)}
              </span>
            </div>
          </>
        )}
        <div className="tg-num">
          #{ticket.metadata?.metadata?.number
            ? String(ticket.metadata.metadata.number).padStart(3, '0')
            : String(ticket.id).padStart(3, '0')}
        </div>
        <div className="tg-name">{displayName}</div>
        <div className="tg-date">{new Date(ticket.created_at).toLocaleDateString('ko-KR')}</div>
      </div>
      <div className="tg-grade">{grade}</div>
      {isOwned ? (
        <div className="tg-collected-badge">
          <Check size={9} strokeWidth={3} color="#0a0800" />
        </div>
      ) : (
        <div className="tg-lock">
          <Lock size={22} />
        </div>
      )}
    </div>
  )
}

// ─── TicketModal ───────────────────────────────────────────────────────────────

interface TicketModalProps {
  ticket: CatalogItem
  group: CatalogGroup
  isOwned: boolean
  stubId?: number
  onToggleOwned: () => Promise<void>
  onClose: () => void
}

function TicketModal({ ticket, group, isOwned, onToggleOwned, onClose }: TicketModalProps) {
  const { data: session } = useSession()
  const [toggling, setToggling] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(ticket.like_count)
  const [liking, setLiking] = useState(false)
  const [checkingLike, setCheckingLike] = useState(true)
  const displayName = parseTitle(ticket.title)
  const meta = (ticket.metadata?.metadata || {}) as Record<string, any>
  const isLoggedIn = !!session


  // 티켓이 변경되면 상태 초기화 및 좋아요 정보 새로 불러오기
  useEffect(() => {
    // 초기 카운트 설정
    setLikeCount(ticket.like_count)
    setLiked(false)
    setCheckingLike(true)

    // 로그인하지 않은 경우 좋아요 상태 확인 생략
    if (!isLoggedIn) {
      setCheckingLike(false)
      return
    }

    const checkLikeStatus = async () => {
      try {
        const res = await likesApi.checkLike(ticket.id)
        setLiked(res.liked)
      } catch (error: any) {
        console.error('좋아요 상태 확인 실패:', error)
        // 에러 시 기본값 false 유지
        setLiked(false)
      } finally {
        setCheckingLike(false)
      }
    }

    checkLikeStatus()
  }, [ticket.id, isLoggedIn])

  const handleToggle = async () => {
    setToggling(true)
    try {
      await onToggleOwned()
    } finally {
      setToggling(false)
    }
  }

  const handleLike = async () => {
    if (liking) return

    // 로그인 확인
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.')
      return
    }

    // 낙관적 업데이트 (사용자 경험 개선)
    const previousLiked = liked
    const previousCount = likeCount
    const willLike = !liked

    setLiking(true)
    setLiked(willLike)
    setLikeCount(willLike ? likeCount + 1 : likeCount - 1)

    try {
      const res = await likesApi.toggle(ticket.id)

      // 서버 응답으로 최종 상태 확정
      setLiked(res.liked)
      // 카운트는 서버 응답 기준으로 다시 계산
      if (res.liked !== previousLiked) {
        setLikeCount(res.liked ? previousCount + 1 : previousCount - 1)
      } else {
        // 서버 상태가 이전과 같다면 롤백
        setLikeCount(previousCount)
      }
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error)

      // 에러 시 이전 상태로 롤백
      setLiked(previousLiked)
      setLikeCount(previousCount)

      const errorMessage = error.response?.data?.message || '좋아요 처리에 실패했습니다.'
      alert(errorMessage + '\n로그인 상태를 확인해주세요.')
    } finally {
      setLiking(false)
    }
  }

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* 티켓 카드 */}
        <div className="modal-ticket">
          <div className={`modal-ticket-hero ${getCategoryColor(group.category?.code)}`}>
            {ticket.image_url ? (
              ticket.image_url.endsWith('.mp4') ? (
                <video
                  src={ticket.image_url}
                  className={`modal-ticket-image${isOwned ? '' : ' locked'}`}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  autoPlay loop muted playsInline
                />
              ) : (
                <img
                  src={ticket.image_url}
                  alt={displayName}
                  className={`modal-ticket-image${isOwned ? '' : ' locked'}`}
                />
              )
            ) : (
              <>
                <div className="modal-glow" style={{ background: getGlowColor(group.category?.code) }} />
                <div className="modal-emoji">{getCategoryIcon(group.category?.code)}</div>
              </>
            )}
            {!isOwned && (
              <div className="modal-ticket-locked-overlay">
                <Lock size={36} color="rgba(255,255,255,0.5)" />
              </div>
            )}
          </div>
          <div className="modal-ticket-body">
            <div className="modal-ticket-num">
              #{meta.number ? String(meta.number).padStart(3, '0') : String(ticket.id).padStart(3, '0')}
              {' '}— {group.category?.code || 'OTHER'}
            </div>
            <div className="modal-ticket-title">{displayName}</div>
            <div className="modal-ticket-sub">
              {ticket.description || group.name}
            </div>
          </div>
        </div>

        {/* 아이템 정보 그리드 */}
        <div className="modal-info-grid">
          <div className="modal-info-item">
            <div className="modal-info-lbl">GRADE</div>
            <div className="modal-info-val">{meta.section || 'VIP'}</div>
          </div>
          <div className="modal-info-item">
            <div className="modal-info-lbl">VENUE</div>
            <div className="modal-info-val">{meta.venue || '정보 없음'}</div>
          </div>
          <div className="modal-info-item">
            <div className="modal-info-lbl">SEAT</div>
            <div className="modal-info-val">{meta.seat_info || '정보 없음'}</div>
          </div>
          <div className="modal-info-item">
            <div className="modal-info-lbl">STATUS</div>
            <div className="modal-info-val" style={{ color: isOwned ? 'var(--gold)' : 'var(--txt-muted)' }}>
              {isOwned ? '✓ 수집완료' : '미수집'}
            </div>
          </div>
          <div className="modal-info-item">
            <div className="modal-info-lbl">LIKES</div>
            <div className="modal-info-val" style={{ color: liked ? '#e03a3a' : '#f0ece4' }}>
              {liked ? '♥ ' : '♡ '}{likeCount}
            </div>
          </div>
          <div className="modal-info-item">
            <div className="modal-info-lbl">VIEWS</div>
            <div className="modal-info-val">{ticket.view_count}</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="modal-actions">
          <button
            className={isOwned ? 'modal-btn-danger' : 'modal-btn-primary'}
            onClick={handleToggle}
            disabled={toggling}
            style={{ flex: 1 }}
          >
            {toggling ? (
              <Loader2 size={16} className="spin" />
            ) : isOwned ? (
              <>
                <Check size={16} />
                보유 해제
              </>
            ) : (
              <>
                <Plus size={16} />
                보유 등록
              </>
            )}
          </button>
          <button
            className="modal-btn-sec"
            onClick={handleLike}
            disabled={liking || checkingLike || !isLoggedIn}
            style={{
              pointerEvents: liking || checkingLike || !isLoggedIn ? 'none' : 'auto',
              opacity: liking || checkingLike ? 0.5 : !isLoggedIn ? 0.3 : 1,
              cursor: liking || checkingLike ? 'wait' : !isLoggedIn ? 'not-allowed' : 'pointer',
            }}
            title={!isLoggedIn ? '로그인이 필요합니다' : liked ? '좋아요 취소' : '좋아요'}
          >
            {liking ? (
              <Loader2 size={18} className="spin" style={{ color: '#e03a3a' }} />
            ) : (
              <span className={liked ? 'heart-liked' : 'heart-not-liked'}>
                <Heart size={18} />
              </span>
            )}
          </button>
          <div className="modal-btn-sec" onClick={() => alert('공유')}>
            <Share2 size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}
