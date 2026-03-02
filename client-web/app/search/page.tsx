'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CategoryFilter from '@/components/CategoryFilter'
import DynamicTitle from '@/components/DynamicTitle'
import { Search, X, Music, Trophy, Film, Drama, Palette, PartyPopper, Ticket, ChevronLeft, Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { catalogGroupsApi, categoriesApi } from '@/lib/api'
import type { CatalogGroup, Category } from '@/lib/api/types'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'

export default function SearchPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { adsEnabled } = useAppSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('CINEMA') // 영화 카테고리 고정
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<CatalogGroup[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = localStorage.getItem('recent_searches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }

    // Load categories from API
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const roots = await categoriesApi.getRoots()
      setCategories([
        { id: 0, code: 'ALL', name: '전체', icon: '', color: '', depth: 0, parent_id: null, item_type: null, sort_order: 0, created_at: '' },
        ...roots,
      ])
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories([
        { id: 0, code: 'ALL', name: '전체', icon: '', color: '', depth: 0, parent_id: null, item_type: null, sort_order: 0, created_at: '' },
      ])
    }
  }

  const handleSearch = async (query?: string, saveToRecent: boolean = false) => {
    const searchTerm = query !== undefined ? query : searchQuery

    if (!searchTerm.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await catalogGroupsApi.getAll({ limit: 500 })
      // Filter results by group name (카탈로그 그룹 이름으로 검색)
      const filtered = response.data.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(filtered)

      // Save to recent searches only when explicitly requested
      if (saveToRecent) {
        const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('recent_searches', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleSearchClick = () => {
    handleSearch(undefined, true) // 검색 버튼 클릭 시 최근 검색어 저장
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    handleSearch(keyword, true) // 키워드 클릭 시 최근 검색어 저장
  }

  const removeRecentSearch = (keyword: string) => {
    const updated = recentSearches.filter((s) => s !== keyword)
    setRecentSearches(updated)
    localStorage.setItem('recent_searches', JSON.stringify(updated))
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
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

  const getCategoryIcon = (code?: string) => {
    const iconMap: Record<string, React.ElementType> = {
      MUSIC: Music,
      SPORTS: Trophy,
      THEATER: Drama,
      EXHIBITION: Palette,
      CINEMA: Film,
      FESTIVAL: PartyPopper,
    }
    const IconComponent = iconMap[code || ''] || Ticket
    return <IconComponent size={20} />
  }

  return (
    <>
      <DynamicTitle pageName="검색" />
      <div className="app-container">
        {/* Header with Back Button and Search Bar */}
        <header className="app-header" style={{ gap: '8px', padding: '0 16px' }}>
          <div className="icon-btn" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </div>
          <div className="search-bar" style={{ flex: 1, margin: 0, paddingLeft: '16px' }}>
            <input
              type="text"
              placeholder="아티스트, 경기, 공연명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchClick() // Enter 키 시 최근 검색어 저장
                }
              }}
              autoComplete="off"
              autoFocus
              style={{ paddingLeft: 0 }}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="search-clear-btn">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="icon-btn" onClick={handleSearchClick}>
            <Search size={20} />
          </div>
        </header>

        <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>

          {/* Category Filter Chips - 현재 숨김 (영화 카테고리 고정) */}
          {/* <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            style={{ paddingTop: '14px' }}
          /> */}

          {/* Ad Banner Slot */}
          {adsEnabled && (
            <div id="banner-ad-slot" className="anim anim-d1" style={{ marginTop: '16px' }}>
              <span className="ad-placeholder-text">광고 연결 영역</span>
            </div>
          )}

          <div className="page-content" style={{ paddingTop: '16px' }}>
            {isSearching ? (
              searchResults.length > 0 ? (
              /* Search Results - Catalog Groups */
              <div style={{ margin: '0 20px' }}>
                <div className="result-count" style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--txt-muted)', fontFamily: "'DM Mono', monospace" }}>
                  검색 결과 <strong style={{ color: 'var(--txt)' }}>{searchResults.length}</strong>개
                </div>
                <div className="group-grid anim anim-d1">
                  {searchResults.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onClick={() => router.push(`/catalog/${group.id}`)}
                    />
                  ))}
                </div>
              </div>
              ) : (
                /* No Results */
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <div style={{ fontSize: '15px', color: 'var(--txt)', marginBottom: '8px', fontWeight: '600' }}>
                    검색 결과가 없습니다
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
                    다른 검색어로 시도해보세요
                  </div>
                </div>
              )
            ) : (
              /* Default View */
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="recent-section anim">
                    <div className="recent-label">최근 검색</div>
                    <div className="recent-tags">
                      {recentSearches.map((keyword, index) => (
                        <div key={index} className="recent-tag">
                          <span onClick={() => handleKeywordClick(keyword)}>{keyword}</span>
                          <span className="remove" onClick={() => removeRecentSearch(keyword)}>
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
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
  const isHot = group.view_count > 500
  const isNew = new Date(group.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  const getCategoryIcon = (code?: string) => {
    const iconMap: Record<string, React.ElementType> = {
      MUSIC: Music,
      SPORTS: Trophy,
      THEATER: Drama,
      EXHIBITION: Palette,
      CINEMA: Film,
      FESTIVAL: PartyPopper,
    }
    const IconComponent = iconMap[code || ''] || Ticket
    return <IconComponent size={20} />
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

  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-thumb">
        <div className={`group-thumb-bg ${getCategoryColor(group.category?.code)}`}>
          <div
            className="group-glow"
            style={{ background: getGlowColor(group.category?.code) }}
          />
          {group.thumbnail_url ? (
            group.thumbnail_url.endsWith('.mp4') ? (
              <video
                src={group.thumbnail_url}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.85 }}
                autoPlay loop muted playsInline
              />
            ) : (
              <img
                src={group.thumbnail_url}
                alt={group.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.85 }}
              />
            )
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
