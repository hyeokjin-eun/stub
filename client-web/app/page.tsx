'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Music, Trophy, Film, Drama, Palette, PartyPopper, Ticket, Flame, Sparkles } from 'lucide-react'
import Header from '@/components/Header'
import Banner from '@/components/Banner'
import QuickStats from '@/components/QuickStats'
import TicketCard from '@/components/TicketCard'
import CategoryFilter from '@/components/CategoryFilter'
import { categoriesApi, catalogItemsApi, catalogGroupsApi, usersApi } from '@/lib/api'
import type { Category, CatalogItem, CatalogGroup } from '@/lib/api/types'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('CINEMA') // 영화 카테고리 고정
  const [tickets, setTickets] = useState<CatalogItem[]>([])
  const [groups, setGroups] = useState<CatalogGroup[]>([])
  const [loading, setLoading] = useState(true)

  // QuickStats 데이터
  const [totalTickets, setTotalTickets] = useState(0)
  const [totalCollections, setTotalCollections] = useState(0)
  const [totalCollectors, setTotalCollectors] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Starting to load data...')

      // Try direct fetch first to test connectivity
      console.log('Testing direct fetch...')
      const testResponse = await fetch('http://localhost:3002/categories')
      if (!testResponse.ok) {
        throw new Error(`HTTP error! status: ${testResponse.status}`)
      }
      const testData = await testResponse.json()
      console.log('✅ Direct fetch works:', testData)

      // Now try with API client - including stats data
      const [categoriesData, ticketsData, groupsData, collectorsCount] = await Promise.all([
        categoriesApi.getAll(),
        catalogItemsApi.getAll({ limit: 20 }),
        catalogGroupsApi.getAll({ limit: 100 }),
        usersApi.getCount().catch(() => 0),
      ])
      console.log('✅ Categories loaded:', categoriesData)
      console.log('✅ Tickets loaded:', ticketsData)
      console.log('✅ Groups loaded:', groupsData)

      setCategories([{ id: 0, code: 'ALL', name: '전체', icon: '', color: '', created_at: '' }, ...categoriesData])
      setTickets(ticketsData.data)

      // Store all groups for different sections
      setGroups(groupsData.data)
      setTotalTickets(ticketsData.total)
      setTotalCollections(groupsData.total)
      setTotalCollectors(collectorsCount)

      console.log('✅ State updated successfully')
    } catch (error: any) {
      console.error('❌ Failed to load data:', error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      if (error.response) {
        console.error('❌ Response error:', error.response.data)
      }
      // Set empty data to exit loading state
      setCategories([{ id: 0, code: 'ALL', name: '전체', icon: '', color: '', created_at: '' }])
      setTickets([])
      setGroups([])
      setTotalTickets(0)
      setTotalCollections(0)
      setTotalCollectors(0)
    } finally {
      setLoading(false)
      console.log('🏁 Loading finished')
    }
  }

  // 카테고리별 필터링
  const filteredTickets =
    activeCategory === 'ALL'
      ? tickets
      : tickets.filter((t) => t.category?.code === activeCategory)

  const filteredGroups =
    activeCategory === 'ALL'
      ? groups
      : groups.filter((g) => g.category?.code === activeCategory)

  // 추천 컬렉션: 랜덤 5개
  const recommendedGroups = [...groups].sort(() => Math.random() - 0.5).slice(0, 5)

  // 최근 등록: 최신순 6개 (카테고리 필터링 적용)
  const recentGroups = [...filteredGroups]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  // 지금 인기: view_count 기준 상위 5개
  const trendingGroups = [...groups]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)

  return (
    <>
      <Header />
      <div className="page-content">
        {/* Banner */}
        <Banner />

        {/* Quick Stats */}
        <QuickStats
          totalTickets={totalTickets}
          totalCollections={totalCollections}
          totalCollectors={totalCollectors}
          loading={loading}
        />

        {/* Ad Banner Slot */}
        <div id="banner-ad-slot" className="anim anim-d2">
          <span className="ad-placeholder-text">광고 연결 영역</span>
        </div>

        {/* Category Chips - 현재 숨김 (영화 카테고리 고정) */}
        {/* <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          className="anim anim-d2"
          style={{ paddingTop: '14px' }}
        /> */}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            로딩 중...
          </div>
        ) : (
          <>
            {/* 추천 컬렉션 */}
            <div className="section-header anim anim-d3">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                추천 컬렉션
              </div>
              <a href="/catalog" className="section-more">
                전체보기
              </a>
            </div>

            <div className="h-scroll anim anim-d4">
              {recommendedGroups.map((group) => (
                <div
                  key={group.id}
                  className="collection-card"
                  onClick={() => router.push(`/catalog/${group.id}`)}
                >
                  <div className="collection-thumb">
                    {group.thumbnail_url ? (
                      <img
                        src={group.thumbnail_url}
                        alt={group.name}
                        className="collection-image"
                      />
                    ) : (
                      <div
                        className="collection-placeholder"
                        style={{
                          background: `linear-gradient(135deg, ${getGlowColor(group.category?.code)}, ${getGlowColor(group.category?.code)}88)`,
                        }}
                      >
                        <div className="collection-emoji">
                          {getCategoryIcon(group.category?.code)}
                        </div>
                      </div>
                    )}
                    <div className="collection-overlay" />
                    <div className="collection-badge">{group.category?.code || 'OTHER'}</div>
                  </div>
                  <div className="collection-info">
                    <div className="collection-title">{group.name}</div>
                    <div className="collection-meta">
                      {group.ticket_count}개 티켓 · {group.view_count}명
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 지금 인기 (트렌딩) */}
            <div className="section-header" style={{ marginTop: '8px' }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={16} />
                지금 인기
              </div>
              <a href="/catalog" className="section-more">
                더보기
              </a>
            </div>

            <div
              style={{
                margin: '0 20px',
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              {trendingGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="trending-item"
                  onClick={() => router.push(`/catalog/${group.id}`)}
                >
                  <div className={`trending-rank ${index >= 3 ? 'dim' : ''}`}>{index + 1}</div>
                  <div className="trending-thumb">
                    {group.thumbnail_url ? (
                      <img
                        src={group.thumbnail_url}
                        alt={group.name}
                        className="trending-thumb-image"
                      />
                    ) : (
                      <div
                        className="trending-thumb-placeholder"
                        style={{
                          background: `linear-gradient(135deg, ${getGlowColor(group.category?.code)}, ${getGlowColor(group.category?.code)}88)`,
                        }}
                      >
                        <span className="trending-thumb-emoji">
                          {getCategoryIcon(group.category?.code)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="trending-info">
                    <div className="trending-title">{group.name}</div>
                    <div className="trending-meta">
                      {group.category?.name} · {group.ticket_count}개 티켓
                    </div>
                  </div>
                  <div className="trending-count">{group.view_count}</div>
                </div>
              ))}
            </div>

            {/* 최근 등록 */}
            <div className="section-header" style={{ marginTop: '8px' }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                최근 등록
              </div>
              <a href="/catalog" className="section-more">
                전체보기
              </a>
            </div>

            <div className="grid-2" style={{ paddingBottom: '8px' }}>
              {recentGroups.map((group) => (
                <div
                  key={group.id}
                  className="collection-card collection-card-grid"
                  onClick={() => router.push(`/catalog/${group.id}`)}
                >
                  <div className="collection-thumb">
                    {group.thumbnail_url ? (
                      <img
                        src={group.thumbnail_url}
                        alt={group.name}
                        className="collection-image"
                      />
                    ) : (
                      <div
                        className="collection-placeholder"
                        style={{
                          background: `linear-gradient(135deg, ${getGlowColor(group.category?.code)}, ${getGlowColor(group.category?.code)}88)`,
                        }}
                      >
                        <div className="collection-emoji">
                          {getCategoryIcon(group.category?.code)}
                        </div>
                      </div>
                    )}
                    <div className="collection-overlay" />
                    <div className="collection-badge">{group.category?.code || 'OTHER'}</div>
                  </div>
                  <div className="collection-info">
                    <div className="collection-title">{group.name}</div>
                    <div className="collection-meta">
                      {group.ticket_count}개 티켓 · {group.view_count}명
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

// Helper functions
function getRandomColor(seed: number): string {
  const colors = ['#7b2ff7', '#e03a3a', '#00c8b0', '#2a4c9f', '#f0a020', '#20a050', '#e74c78', '#3ba8d8']
  return colors[seed % colors.length]
}

function getCategoryColor(code: string): string {
  const colorMap: Record<string, string> = {
    MUSIC: 'purple',
    SPORTS: 'red',
    THEATER: 'teal',
    EXHIBITION: 'amber',
    CINEMA: 'navy',
    FESTIVAL: 'rose',
  }
  return colorMap[code] || 'purple'
}

function getCategoryIcon(code?: string) {
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

function getGradeFromMetadata(metadata: any): string | undefined {
  if (!metadata) return undefined
  if (metadata.section === 'VIP') return 'VIP'
  if (metadata.section === 'R석') return 'R'
  if (metadata.section === 'S석') return 'S'
  if (metadata.section === 'A석') return 'A'
  return undefined
}

function getGlowColor(code?: string): string {
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
