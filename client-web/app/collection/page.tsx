'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderHeart, Trash2, X } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { collectionsApi, collectionLikesApi } from '@/lib/api'
import type { Collection } from '@/lib/api/types'

export default function CollectionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine')
  const [myCollections, setMyCollections] = useState<Collection[]>([])
  const [publicCollections, setPublicCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLikes, setTotalLikes] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadCollections() }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const [mine, publicData] = await Promise.all([
        collectionsApi.getMine().catch(() => []),
        collectionsApi.getPublic().catch(() => []),
      ])
      setMyCollections(mine)
      setPublicCollections(publicData)
      const likes = await collectionLikesApi.getTotalLikes(mine.map((c) => c.id)).catch(() => 0)
      setTotalLikes(likes)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('컬렉션을 삭제할까요?')) return
    await collectionsApi.remove(id)
    setMyCollections((prev) => prev.filter((c) => c.id !== id))
  }

  const totalItems = myCollections.reduce((s, c) => s + c.total_count, 0)

  // 검색 필터링
  const allCollections = activeTab === 'mine' ? myCollections : publicCollections
  const collections = searchQuery.trim()
    ? allCollections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCollections

  return (
    <div className="app-container">
      <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>

        <header className="cat-app-header anim">
          <div className="logo">OT<span>BOOK</span></div>
          <div className="header-actions">
            <div className="icon-btn" onClick={() => router.push('/collection/new')}>
              <Plus size={20} />
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="ticket-tabs anim anim-d1" style={{ marginTop: '12px' }}>
          <div
            className={`ticket-tab ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            내 컬렉션 {myCollections.length}
          </div>
          <div
            className={`ticket-tab ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveTab('public')}
          >
            다른 사람 컬렉션 {publicCollections.length}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 20px', marginTop: '12px' }}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="컬렉션 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="stats-strip anim anim-d2" style={{ marginTop: '12px' }}>
          <div className="stat-item">
            <div className="stat-val">{myCollections.length}</div>
            <div className="stat-lbl">총 컬렉션</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{totalItems}</div>
            <div className="stat-lbl">총 수집품</div>
          </div>
          <div className="stat-item">
            <div className="stat-val" style={{ color: totalLikes > 0 ? '#e03a3a' : undefined }}>
              {totalLikes}
            </div>
            <div className="stat-lbl">총 좋아요</div>
          </div>
        </div>

          {/* Ad Banner */}
          <div id="banner-ad-slot" className="anim anim-d2" style={{ marginTop: '12px' }}>
            <span className="ad-placeholder-text">광고 연결 영역</span>
          </div>

        <div style={{ padding: '16px 12px 0' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>
              로딩 중...
            </div>
          ) : collections.length === 0 ? (
            searchQuery.trim() ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)', marginBottom: 4 }}>
                  검색 결과가 없습니다
                </div>
                <div style={{ fontSize: 13 }}>다른 검색어로 시도해보세요</div>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="group-grid">
              {collections.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  onClick={() => router.push(`/collection/${col.id}`)}
                  onDelete={activeTab === 'mine' ? () => handleDelete(col.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>

      </main>
      <Navigation />
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '12px', padding: '60px 24px', color: 'var(--txt-muted)',
    }}>
      <FolderHeart size={48} strokeWidth={1.2} />
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--txt)' }}>
        아직 컬렉션이 없어요
      </div>
      <div style={{ fontSize: '13px', textAlign: 'center', lineHeight: 1.6 }}>
        원하는 수집품들을 모아 나만의 컬렉션을 만들어보세요
      </div>
    </div>
  )
}

// ─── CollectionCard ───────────────────────────────────────────────────────────

function CollectionCard({ collection, onClick, onDelete }: {
  collection: Collection
  onClick: () => void
  onDelete?: () => void
}) {
  const thumbItems = collection.collection_items?.slice(0, 4) ?? []

  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-thumb">
        <div className="group-thumb-bg c-navy">
          {thumbItems.length > 0 ? (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              width: '100%', height: '100%', gap: '1px', overflow: 'hidden',
            }}>
              {[0, 1, 2, 3].map((i) => {
                const img = thumbItems[i]?.catalog_item?.image_url
                return (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <FolderHeart size={36} color="rgba(255,255,255,0.2)" />
            </div>
          )}
        </div>
        <div className="badge-row">
          <div className="badge badge-cat">{collection.is_public ? '공개' : '비공개'}</div>
        </div>
        <div className="count-chip">{collection.total_count}개</div>
      </div>

      <div className="group-info">
        <div className="group-name">{collection.name}</div>
        <div className="group-sub-row">
          <div className="group-sub">{collection.description || '설명 없음'}</div>
          <div className="group-likes">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {collection.like_count || 0}
          </div>
        </div>
      </div>

      {onDelete && (
        <div
          style={{
            position: 'absolute', top: '8px', right: '8px', zIndex: 4,
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 size={12} color="rgba(255,255,255,0.6)" />
        </div>
      )}
    </div>
  )
}
