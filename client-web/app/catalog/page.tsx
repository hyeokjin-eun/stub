'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, BarChart3, Ticket, Search, Clock, TrendingUp, Hash, Music, Trophy, Film, Drama, Palette, PartyPopper } from 'lucide-react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import CategoryFilter from '@/components/CategoryFilter'
import { catalogGroupsApi, categoriesApi, catalogItemsApi, stubsApi } from '@/lib/api'
import type { CatalogGroup, Category } from '@/lib/api/types'

const getCategoryIcon = (code: string) => {
  const iconMap: Record<string, React.ElementType> = {
    MUSIC: Music,
    SPORTS: Trophy,
    CINEMA: Film,
    THEATER: Drama,
    EXHIBITION: Palette,
    FESTIVAL: PartyPopper,
  }
  const IconComponent = iconMap[code] || Ticket
  return <IconComponent size={18} />
}

type SortOption = 'popular' | 'latest' | 'order'

export default function CatalogPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeFilter, setActiveFilter] = useState('CINEMA')
  const [groups, setGroups] = useState<CatalogGroup[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalGroups: 0,
    myCollected: 0,
    myAchievement: 0, // 달성률 %
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [groupsData, categoriesData, itemsData] = await Promise.all([
        catalogGroupsApi.getAll({ limit: 500 }),
        categoriesApi.getAll(),
        catalogItemsApi.getAll({ limit: 1000 }),
      ])

      setGroups(groupsData.data)
      setCategories([
        { id: 0, code: 'ALL', name: '전체', icon: '', color: '', created_at: '' },
        ...categoriesData,
      ])

      // 로그인 유저면 내 수집 현황 조회
      let myCollected = 0
      if (session?.user) {
        const myStubs = await stubsApi.getMyStubs().catch(() => [])
        myCollected = myStubs.filter((s) => s.status === 'collected').length
      }

      const totalTickets = itemsData.total
      setStats({
        totalTickets,
        totalGroups: groupsData.total,
        myCollected,
        myAchievement: totalTickets > 0 ? Math.round((myCollected / totalTickets) * 100) : 0,
      })
    } catch (error) {
      console.error('Failed to load catalog data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 자식 그룹만 표시 (parent_group_id가 있는 것만)
  const leafGroups = groups.filter((g) => g.parent_group_id != null)

  // 카테고리 필터링
  let filteredGroups =
    activeFilter === 'ALL'
      ? leafGroups
      : leafGroups.filter((g) => g.category?.code === activeFilter)

  // 정렬
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.view_count - a.view_count
      case 'latest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'order':
        return a.id - b.id
      default:
        return 0
    }
  })

  const groupedByCategory: Record<string, CatalogGroup[]> = {}
  if (activeFilter === 'ALL') {
    categories.slice(1).forEach((cat) => {
      const categoryGroups = leafGroups.filter((g) => g.category?.code === cat.code)
      groupedByCategory[cat.code] = [...categoryGroups].sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            return b.view_count - a.view_count
          case 'latest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case 'order':
            return a.id - b.id
          default:
            return 0
        }
      })
    })
  }

  return (
    <>
      <div className="app-container">
        <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>
          {/* Header */}
          <header className="cat-app-header anim">
            <div className="logo">
              OT<span>BOOK</span>
            </div>
            <div className="header-actions">
              <div className="icon-btn" onClick={() => router.push('/search')}>
                <Search size={20} />
              </div>
              <div className="icon-btn" onClick={() => router.push('/notifications')}>
                <Bell size={20} />
              </div>
            </div>
          </header>

          {/* Stats Strip */}
          <div className="stats-strip anim anim-d1">
            <div className="stat-item">
              <div className="stat-val">{stats.totalTickets}</div>
              <div className="stat-lbl">전체 티켓</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">{stats.totalGroups}</div>
              <div className="stat-lbl">그룹</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: stats.myCollected > 0 ? 'var(--gold)' : undefined }}>
                {session?.user ? stats.myCollected : '-'}
              </div>
              <div className="stat-lbl">내 수집</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: stats.myAchievement > 0 ? 'var(--gold)' : undefined }}>
                {session?.user ? `${stats.myAchievement}%` : '-'}
              </div>
              <div className="stat-lbl">달성률</div>
            </div>
          </div>

          {/* Ad Banner Slot */}
          <div id="banner-ad-slot" className="anim anim-d2" style={{ marginTop: '12px' }}>
            <span className="ad-placeholder-text">광고 연결 영역</span>
          </div>

          {/* Filter Tabs - 현재 숨김 (영화 카테고리 고정) */}
          {/* <CategoryFilter
            categories={categories}
            activeCategory={activeFilter}
            onCategoryChange={setActiveFilter}
            className="anim anim-d2"
            style={{ paddingTop: '14px' }}
          /> */}

          {/* Sort Row */}
          <div className="sort-row anim anim-d3">
            <div className="result-count">
              그룹 <strong>{sortedGroups.length}</strong>개
            </div>
            <div className="sort-btn-wrapper" style={{ position: 'relative' }}>
              <div className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
                {sortBy === 'popular' && (
                  <>
                    <TrendingUp size={12} />
                    인기순
                  </>
                )}
                {sortBy === 'latest' && (
                  <>
                    <Clock size={12} />
                    최신순
                  </>
                )}
                {sortBy === 'order' && (
                  <>
                    <Hash size={12} />
                    번호순
                  </>
                )}
              </div>
              {showSortMenu && (
                <div className="sort-menu">
                  <div
                    className={`sort-menu-item ${sortBy === 'popular' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('popular')
                      setShowSortMenu(false)
                    }}
                  >
                    <TrendingUp size={14} />
                    인기순
                  </div>
                  <div
                    className={`sort-menu-item ${sortBy === 'latest' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('latest')
                      setShowSortMenu(false)
                    }}
                  >
                    <Clock size={14} />
                    최신순
                  </div>
                  <div
                    className={`sort-menu-item ${sortBy === 'order' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('order')
                      setShowSortMenu(false)
                    }}
                  >
                    <Hash size={14} />
                    번호순
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Catalog Content */}
          <div id="catalog-content" className="anim anim-d4" style={{ padding: '16px 12px 0' }}>
            {loading ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--txt-muted)',
                }}
              >
                로딩 중...
              </div>
            ) : activeFilter === 'ALL' ? (
              <>
                {categories.slice(1).map((cat) => {
                  const categoryGroups = groupedByCategory[cat.code] || []
                  if (categoryGroups.length === 0) return null

                  return (
                    <div key={cat.code} style={{ marginBottom: '4px' }}>
                      <div className="cat-section-header">
                        <span className="cat-sec-emoji">
                          {getCategoryIcon(cat.code)}
                        </span>
                        <span className="cat-sec-name">{cat.name}</span>
                        <span className="cat-sec-count">
                          {categoryGroups.length}개 그룹
                        </span>
                      </div>
                      <div className="group-grid">
                        {categoryGroups.map((group) => (
                          <GroupCard
                            key={group.id}
                            group={group}
                            onClick={() =>
                              router.push(`/catalog/${group.id}`)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="group-grid">
                {sortedGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onClick={() => router.push(`/catalog/${group.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
        <Navigation />
      </div>
    </>
  )
}

interface GroupCardProps {
  group: CatalogGroup
  onClick: () => void
}

function GroupCard({ group, onClick }: GroupCardProps) {
  const isHot = group.view_count > 500 // Mock HOT logic
  const isNew =
    new Date(group.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days

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

  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-thumb">
        <div className={`group-thumb-bg ${getCategoryColor(group.category?.code)}`}>
          <div
            className="group-glow"
            style={{ background: getGlowColor(group.category?.code) }}
          />
          {group.thumbnail_url ? (
            <img
              src={group.thumbnail_url}
              alt={group.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.85 }}
            />
          ) : (
            <div className="group-emoji">{getCategoryIcon(group.category?.code || '')}</div>
          )}
        </div>
        <div className="badge-row">
          <div className="badge badge-cat">{group.category?.code || 'OTHER'}</div>
          {isHot && <div className="badge badge-hot">HOT</div>}
          {isNew && <div className="badge badge-new">NEW</div>}
        </div>
        <div className="count-chip">
          <Ticket size={11} />
          {group.ticket_count}
        </div>
      </div>
      <div className="group-info">
        <div className="group-name">{group.name}</div>
        <div className="group-sub-row">
          <div className="group-sub">{group.view_count}명</div>
          <div className="group-likes">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {group.view_count}
          </div>
        </div>
      </div>
    </div>
  )
}
