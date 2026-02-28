'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight, Check, Lock, Trash2, Heart, Send, User, MessageCircle, Edit, X } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { collectionsApi, collectionLikesApi, collectionCommentsApi } from '@/lib/api'
import type { Collection, CollectionItem, CollectionComment } from '@/lib/api/types'

const PAGE_SIZE = 6

const parseTitle = (title: string) => {
  const match = title?.match(/^OGT No\.\d+\s+(.+)\s+티켓$/)
  return match ? match[1] : title
}

const getCategoryColor = (code?: string) => {
  const m: Record<string, string> = {
    MUSIC: 'c-purple', SPORTS: 'c-red', THEATER: 'c-teal',
    EXHIBITION: 'c-amber', CINEMA: 'c-navy', FESTIVAL: 'c-rose',
  }
  return m[code || ''] || 'c-purple'
}

const getGlowColor = (code?: string) => {
  const m: Record<string, string> = {
    MUSIC: '#7b2ff7', SPORTS: '#e03a3a', THEATER: '#00c8b0',
    EXHIBITION: '#c9a84c', CINEMA: '#2a4c9f', FESTIVAL: '#e74c78',
  }
  return m[code || ''] || '#7b2ff7'
}

const getCategoryIcon = (code?: string) => {
  const m: Record<string, string> = {
    MUSIC: '🎤', SPORTS: '⚽', CINEMA: '🎬',
    THEATER: '🎭', EXHIBITION: '🎨', FESTIVAL: '🎪',
  }
  return m[code || ''] || '🎫'
}

export default function CollectionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const collectionId = Number(params.id)

  const [collection, setCollection] = useState<Collection | null>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'comments'>('items')
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<CollectionComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', is_public: true })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [data, likeStatus, commentsData] = await Promise.all([
        collectionsApi.getOne(collectionId),
        collectionLikesApi.getStatus(collectionId).catch(() => ({ liked: false, likeCount: 0 })),
        collectionCommentsApi.getByCollection(collectionId).catch(() => []),
      ])
      setCollection(data)
      setLiked(likeStatus.liked)
      setLikeCount(likeStatus.likeCount)
      setComments(commentsData)
    } catch {
      router.push('/collection')
    } finally {
      setLoading(false)
    }
  }, [collectionId])

  useEffect(() => { loadData() }, [loadData])

  const handleRemoveItem = async (catalogItemId: number) => {
    if (!confirm('이 아이템을 컬렉션에서 제거할까요?')) return
    await collectionsApi.removeItem(collectionId, catalogItemId)
    setCollection((prev) => prev ? {
      ...prev,
      collection_items: prev.collection_items.filter((ci) => ci.catalog_item_id !== catalogItemId),
      total_count: prev.total_count - 1,
    } : prev)
  }

  const handleLike = async () => {
    const prev = { liked, likeCount }
    // 낙관적 업데이트
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    try {
      const res = await collectionLikesApi.toggle(collectionId)
      setLiked(res.liked)
      setLikeCount(res.likeCount)
    } catch {
      setLiked(prev.liked)
      setLikeCount(prev.likeCount)
    }
  }

  if (loading || !collection) {
    return (
      <div className="app-container">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>로딩 중...</div>
      </div>
    )
  }

  const items = collection.collection_items ?? []

  const pageCount = Math.ceil(items.length / PAGE_SIZE)
  const currentItems = items.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const paddedItems: (CollectionItem | null)[] = [...currentItems]
  if (paddedItems.length % 2 !== 0 && items.length > 0) paddedItems.push(null)

  const progress = collection.total_count > 0
    ? Math.round((collection.collected_count / collection.total_count) * 100)
    : 0

  const goToPage = (page: number) => {
    if (page < 0 || page >= pageCount || page === currentPage) return
    setCurrentPage(page)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const newComment = await collectionCommentsApi.create(collectionId, commentText.trim())
      setComments([newComment, ...comments])
      setCommentText('')
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('댓글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제할까요?')) return
    try {
      await collectionCommentsApi.delete(commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  const handleEditClick = () => {
    if (!collection) return
    setEditForm({
      name: collection.name,
      description: collection.description || '',
      is_public: collection.is_public,
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      alert('컬렉션 이름을 입력하세요.')
      return
    }
    try {
      const updated = await collectionsApi.update(collectionId, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        is_public: editForm.is_public,
      })
      setCollection(updated)
      setShowEditModal(false)
      alert('컬렉션이 수정되었습니다.')
    } catch (error) {
      console.error('Failed to update collection:', error)
      alert('컬렉션 수정에 실패했습니다.')
    }
  }

  // 내가 만든 컬렉션인지 확인
  const isMyCollection = session?.user?.id && collection?.user_id === Number(session.user.id)

  return (
    <div className="app-container">
      <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>
        {/* TopBar */}
        <div className="detail-topbar">
          <div className="icon-btn" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </div>
          <div className="header-actions">
            {isMyCollection ? (
              <div className="icon-btn" onClick={handleEditClick}>
                <Edit size={18} />
              </div>
            ) : (
              <div
                className="icon-btn"
                onClick={handleLike}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20,
                  background: liked ? 'rgba(224,58,58,.18)' : 'rgba(255,255,255,.06)',
                  border: `1px solid ${liked ? 'rgba(224,58,58,.4)' : 'rgba(255,255,255,.1)'}`,
                  cursor: 'pointer', transition: 'all .2s',
                }}
              >
                <Heart
                  size={15}
                  fill={liked ? 'var(--red)' : 'none'}
                  color={liked ? 'var(--red)' : 'var(--txt-muted)'}
                  style={{ transition: 'all .2s' }}
                />
                <span style={{ fontSize: 13, fontFamily: 'DM Mono', color: liked ? 'var(--red)' : 'var(--txt-muted)' }}>
                  {likeCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="detail-hero c-navy">
          <div className="hero-bg">
            <div className="hero-glow-big" style={{ background: '#2a4c9f' }} />
            <div className="hero-emoji">📁</div>
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-cat">{collection.is_public ? '공개' : '비공개'}</div>
            <div className="hero-title">{collection.name}</div>
            <div className="hero-sub">{collection.description || ''} · {collection.total_count}종</div>
          </div>

          {/* 좋아요 배지 */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 3,
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '20px',
            background: likeCount > 0 ? 'rgba(224,58,58,.18)' : 'rgba(0,0,0,.4)',
            border: `1px solid ${likeCount > 0 ? 'rgba(224,58,58,.4)' : 'rgba(255,255,255,.15)'}`,
            backdropFilter: 'blur(8px)',
          }}>
            <Heart
              size={15}
              fill={likeCount > 0 ? '#e03a3a' : 'none'}
              color={likeCount > 0 ? '#e03a3a' : 'rgba(255,255,255,.7)'}
            />
            <span style={{
              fontSize: '14px', fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif",
              color: likeCount > 0 ? '#e03a3a' : 'rgba(255,255,255,.9)',
              letterSpacing: '0.05em',
            }}>
              {likeCount}
            </span>
          </div>
        </div>

        <div className="content">

          {/* Tabs */}
          <div className="ticket-tabs" style={{ marginTop: '14px' }}>
            <div
              className={`ticket-tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              수집품 {items.length}
            </div>
            <div
              className={`ticket-tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              댓글 {comments.length}
            </div>
          </div>

          {/* Ad Banner */}
          <div id="banner-ad-slot" style={{ margin: '14px 20px 0' }}>
            <span className="ad-placeholder-text">광고 연결 영역</span>
          </div>

          {activeTab === 'items' ? (
            <>
              {/* Pager - 레이아웃 시프트 방지를 위해 항상 영역 확보 */}
              <div className="pager-controls" style={{ visibility: pageCount > 0 ? 'visible' : 'hidden' }}>
                <div className="pager-btn" style={{ opacity: currentPage === 0 ? 0.25 : 1 }} onClick={() => goToPage(currentPage - 1)}>
                  <ChevronLeft size={14} />
                </div>
                <div className="pager-dots">
                  {Array.from({ length: Math.min(pageCount || 1, 10) }).map((_, i) => (
                    <div key={i} className={`pager-dot ${i === currentPage ? 'active' : ''}`} onClick={() => goToPage(i)} />
                  ))}
                </div>
                <span className="page-label">{currentPage + 1} / {pageCount || 1}</span>
                <div className="pager-btn" style={{ opacity: currentPage >= pageCount - 1 ? 0.25 : 1 }} onClick={() => goToPage(currentPage + 1)}>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Grid */}
              <div className="ticket-pager">
                <div className="ticket-grid">
                  {items.length === 0 ? (
                    <div className="tg-empty">
                      <div className="tg-empty-icon">📁</div>
                      <div className="tg-empty-txt">아이템이 없습니다</div>
                    </div>
                  ) : (
                    paddedItems.map((ci, idx) =>
                      ci ? (
                        <CollectionItemCard
                          key={ci.id}
                          item={ci}
                          onRemove={() => handleRemoveItem(ci.catalog_item_id)}
                        />
                      ) : (
                        <div key={`empty-${idx}`} className="tg-card tg-empty-slot" />
                      )
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <CommentsSection
              comments={comments}
              commentText={commentText}
              onCommentChange={setCommentText}
              onSubmit={handleSubmitComment}
              onDelete={handleDeleteComment}
              submitting={submitting}
              currentUserId={session?.user?.id ? Number(session.user.id) : undefined}
            />
          )}
        </div>
      </main>
      <Navigation />

      {/* 수정 모달 */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'var(--card)', borderRadius: '16px',
              border: '1px solid var(--border)',
              width: '100%', maxWidth: '420px',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '18px', fontWeight: 700, color: 'var(--txt)',
                margin: 0,
              }}>
                컬렉션 수정
              </h2>
              <div
                className="icon-btn"
                onClick={() => setShowEditModal(false)}
                style={{ padding: '4px' }}
              >
                <X size={20} />
              </div>
            </div>

            {/* 이름 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'var(--txt)', marginBottom: '6px',
              }}>
                컬렉션 이름 *
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="컬렉션 이름을 입력하세요"
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '14px', color: 'var(--txt)',
                  outline: 'none',
                }}
              />
            </div>

            {/* 설명 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'var(--txt)', marginBottom: '6px',
              }}>
                설명
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="컬렉션에 대한 설명을 입력하세요"
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '14px', color: 'var(--txt)',
                  outline: 'none', resize: 'vertical',
                }}
              />
            </div>

            {/* 공개 여부 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={editForm.is_public}
                  onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--txt)' }}>
                  공개 컬렉션
                </span>
              </label>
              <p style={{
                fontSize: '12px', color: 'var(--txt-muted)',
                margin: '6px 0 0 24px',
              }}>
                공개 컬렉션은 다른 사용자가 볼 수 있습니다
              </p>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--txt)', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  background: 'var(--gold)', border: 'none',
                  color: '#0a0a0a', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s',
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CollectionItemCard ───────────────────────────────────────────────────────

function CollectionItemCard({ item, onRemove }: { item: CollectionItem; onRemove: () => void }) {
  const ticket = item.catalog_item
  const isCollected = item.stub_id != null
  const code = ticket?.category?.code
  const displayName = parseTitle(ticket?.title || '')

  return (
    <div
      className={`tg-card ${isCollected ? 'tg-collected' : 'tg-locked'} ${getCategoryColor(code)}`}
      onClick={() => {
        if (ticket?.catalog_group_id) {
          // 카탈로그 상세로 이동은 하지 않고 제거만 제공
        }
      }}
    >
      <div className="tg-inner">
        {ticket?.image_url ? (
          <img
            className="tg-image"
            src={ticket.image_url}
            alt={displayName}
            style={{ opacity: isCollected ? 0.85 : 0.35 }}
          />
        ) : (
          <>
            <div className="tg-glow" style={{ background: getGlowColor(code), opacity: isCollected ? 0.38 : 0.15 }} />
            <div className="tg-emoji-wrap">
              <span className="tg-emoji" style={{ opacity: isCollected ? 1 : 0.35 }}>
                {getCategoryIcon(code)}
              </span>
            </div>
          </>
        )}
        <div className="tg-name">{displayName || '?'}</div>
      </div>

      {isCollected ? (
        <div className="tg-collected-badge">
          <Check size={9} strokeWidth={3} color="#0a0800" />
        </div>
      ) : (
        <div className="tg-lock"><Lock size={22} /></div>
      )}

      {/* 제거 버튼 */}
      <div
        style={{
          position: 'absolute', bottom: '6px', right: '6px', zIndex: 4,
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
        onClick={(e) => { e.stopPropagation(); onRemove() }}
      >
        <Trash2 size={10} color="rgba(255,255,255,0.7)" />
      </div>
    </div>
  )
}

// ─── CommentsSection ──────────────────────────────────────────────────────────

interface CommentsSectionProps {
  comments: CollectionComment[]
  commentText: string
  onCommentChange: (text: string) => void
  onSubmit: () => void
  onDelete: (commentId: number) => void
  submitting: boolean
  currentUserId?: number
}

function CommentsSection({
  comments,
  commentText,
  onCommentChange,
  onSubmit,
  onDelete,
  submitting,
  currentUserId,
}: CommentsSectionProps) {
  return (
    <div style={{ padding: '16px 20px calc(var(--nav-h) + 20px)' }}>
      {/* 댓글 입력 */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        padding: '12px', background: 'var(--card)',
        borderRadius: '12px', border: '1px solid var(--border)',
      }}>
        <input
          type="text"
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
          }}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            outline: 'none', fontSize: '14px', color: 'var(--txt)',
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!commentText.trim() || submitting}
          style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: commentText.trim() ? 'var(--gold)' : 'var(--border)',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: commentText.trim() ? 'pointer' : 'not-allowed',
            transition: 'all .2s',
          }}
        >
          <Send size={16} color={commentText.trim() ? '#0a0a0a' : 'var(--txt-muted)'} />
        </button>
      </div>

      {/* 댓글 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {comments.length === 0 ? (
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            color: 'var(--txt-muted)', fontSize: '13px',
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <MessageCircle size={48} strokeWidth={1.5} color="var(--txt-muted)" />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>
              첫 댓글을 남겨보세요
            </div>
            <div>이 컬렉션에 대한 생각을 공유해주세요</div>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={onDelete}
              canDelete={currentUserId === comment.user_id}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── CommentItem ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: CollectionComment
  onDelete: (id: number) => void
  canDelete: boolean
}

function CommentItem({ comment, onDelete, canDelete }: CommentItemProps) {
  const timeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diff = now.getTime() - past.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  return (
    <div style={{
      padding: '12px', background: 'var(--card)',
      borderRadius: '12px', border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--surface)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <User size={18} color="var(--txt-muted)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>
              {comment.user?.nickname || '사용자'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--txt-muted)', fontFamily: 'DM Mono' }}>
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p style={{
            fontSize: '14px', color: 'var(--txt)', lineHeight: 1.5,
            margin: 0, wordBreak: 'break-word',
          }}>
            {comment.content}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(224,58,58,.15)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Trash2 size={12} color="#e03a3a" />
          </button>
        )}
      </div>
    </div>
  )
}
