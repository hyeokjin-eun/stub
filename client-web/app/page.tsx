'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Flame, Clock, TrendingUp, Ticket, Tv, Layers, Gift } from 'lucide-react'
import Header from '@/components/Header'
import Banner from '@/components/Banner'
import QuickStats from '@/components/QuickStats'
import DynamicTitle from '@/components/DynamicTitle'
import { ItemTypeIcon } from '@/components/ItemTypeIcon'
import { categoriesApi, catalogItemsApi, catalogGroupsApi, usersApi } from '@/lib/api'
import type { Category, CatalogItem, CatalogGroup, ItemType, ItemTypeUiConfig } from '@/lib/api/types'

// item_type별 메타데이터 (시네마 테마 색상)
const ITEM_TYPE_META: Record<ItemType, { label: string; color: string }> = {
  TICKET:       { label: '티켓',   color: '#c9a84c' },  // 골드
  VIEWING:      { label: '시청',   color: '#00c8b0' },  // 틸
  TRADING_CARD: { label: '카드',   color: '#7b2ff7' },  // 퍼플
  GOODS:        { label: '굿즈',   color: '#e060a0' },  // 로즈
}

// category 계층에서 대분류 추출 (depth=0)
function getRootCategory(category?: Category): Category | undefined {
  if (!category) return undefined
  if (category.depth === 0) return category
  if (category.parent) return getRootCategory(category.parent)
  return category
}

// item_type 추출 (대분류의 item_type)
function getItemType(group: CatalogGroup): ItemType | null {
  const root = getRootCategory(group.category)
  return root?.item_type ?? null
}

// 뱃지에 표시할 카테고리 이름: 소분류 이름 사용 (없으면 대분류)
function getBadgeName(group: CatalogGroup): string {
  return group.category?.name || '기타'
}

// item_type 기반 색상
function getItemTypeColor(group: CatalogGroup): string {
  const type = getItemType(group)
  return type ? ITEM_TYPE_META[type]?.color : '#7b2ff7'
}

// item_type 탭 메타데이터
const ITEM_TYPE_TABS: { type: ItemType; label: string; icon: React.ElementType }[] = [
  { type: 'TICKET', label: '티켓', icon: Ticket },
  { type: 'VIEWING', label: '시청', icon: Tv },
  { type: 'TRADING_CARD', label: '카드', icon: Layers },
  { type: 'GOODS', label: '굿즈', icon: Gift },
]

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [itemTypeConfigs, setItemTypeConfigs] = useState<ItemTypeUiConfig[]>([])
  const [activeItemType, setActiveItemType] = useState<ItemType | 'ALL'>('ALL')
  const [groups, setGroups] = useState<CatalogGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTickets, setTotalTickets] = useState(0)
  const [totalCollections, setTotalCollections] = useState(0)
  const [totalCollectors, setTotalCollectors] = useState(0)

  useEffect(() => {
    loadItemTypeConfigs()
    loadData()
  }, [])

  const loadItemTypeConfigs = async () => {
    try {
      const configs = await categoriesApi.getItemTypeConfigs()
      setItemTypeConfigs(configs)

      // is_default인 타입을 찾아서 activeItemType으로 설정
      const defaultConfig = configs.find((c) => c.is_default)
      if (defaultConfig) {
        setActiveItemType(defaultConfig.item_type as ItemType)
      }
    } catch (error) {
      console.error('Failed to load item type configs:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [ticketsData, groupsData, collectorsCount] = await Promise.all([
        catalogItemsApi.getAll({ limit: 1 }),
        catalogGroupsApi.getAll({ limit: 200 }),
        usersApi.getCount().catch(() => 0),
      ])
      const allGroups = groupsData.data
      setGroups(allGroups)
      setTotalTickets(ticketsData.total)
      setTotalCollections(groupsData.total)
      setTotalCollectors(collectorsCount)
    } catch (error) {
      console.error('Failed to load data:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  // item_type 탭 필터
  const filteredGroups = activeItemType === 'ALL'
    ? groups
    : groups.filter(g => getItemType(g) === activeItemType)

  // 추천 컬렉션: 필터링된 그룹에서 랜덤 10개
  const recommendedGroups = [...filteredGroups]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)

  // 지금 인기: view_count 상위 5개 (필터 적용)
  const trendingGroups = [...filteredGroups]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)

  // 최근 등록: 최신순 6개 (필터 적용)
  const recentGroups = [...filteredGroups]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  // ItemType 탭 동적 생성 (ui_config 기반)
  const visibleItemTypeTabs: Array<{ key: ItemType | 'ALL'; label: string; icon: React.ElementType | null }> = [
    { key: 'ALL' as const, label: '전체', icon: null },
    ...ITEM_TYPE_TABS
      .map((tab) => {
        const config = itemTypeConfigs.find((c) => c.item_type === tab.type)
        return { key: tab.type as ItemType | 'ALL', label: tab.label, icon: tab.icon, config }
      })
      .filter((tab) => {
        const config = (tab as any).config
        // show_in_tab이 false면 숨김
        if (config?.show_in_tab === false) return false
        // skip_ui면 숨김 (자동 선택만 됨)
        if (config?.skip_ui === true) return false
        return true
      })
      .sort((a, b) => {
        // sort_order 순서로 정렬
        const orderA = (a as any).config?.sort_order ?? 999
        const orderB = (b as any).config?.sort_order ?? 999
        return orderA - orderB
      })
  ]

  return (
    <>
      <DynamicTitle />
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

        {/* Item Type 탭 필터 - ui_config 기반 */}
        {visibleItemTypeTabs.length > 1 && (
          <div className="anim anim-d2" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '12px 20px 0', minWidth: 'max-content' }}>
              {visibleItemTypeTabs.map(tab => {
                const isActive = activeItemType === tab.key
                const bgColor = tab.key !== 'ALL' ? ITEM_TYPE_META[tab.key as ItemType]?.color : 'var(--gold)'
                const Icon = tab.icon

                // 활성화 시 글자색: 골드는 어두운 배경색(#0a0a0a), 나머지는 아이보리(#f0ece4)
                const activeTextColor = tab.key === 'TICKET' || tab.key === 'ALL' ? '#0a0a0a' : '#f0ece4'

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveItemType(tab.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '999px',
                      border: '1.5px solid',
                      borderColor: isActive ? bgColor : 'var(--border)',
                      background: isActive ? bgColor : 'var(--card)',
                      color: isActive ? activeTextColor : 'var(--txt-muted)',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Icon && <Icon size={15} color={isActive ? activeTextColor : 'var(--txt-muted)'} />}
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* 추천 컬렉션 */}
            <div className="section-header anim anim-d3">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ItemTypeIcon type="ALL" size={16} color="currentColor" />
                추천 컬렉션
              </div>
              <a href="/catalog" className="section-more">전체보기</a>
            </div>

            <div className="h-scroll anim anim-d4">
              {recommendedGroups.length === 0 ? (
                <div style={{ padding: '40px 20px', color: 'var(--muted)', fontSize: '14px' }}>
                  등록된 컬렉션이 없습니다
                </div>
              ) : recommendedGroups.map((group) => {
                const color = getItemTypeColor(group)
                return (
                  <div
                    key={group.id}
                    className="collection-card"
                    onClick={() => router.push(`/catalog/${group.id}`)}
                  >
                    <div className="collection-thumb">
                      {group.thumbnail_url ? (
                        group.thumbnail_url.endsWith('.mp4') ? (
                          <video src={group.thumbnail_url} className="collection-image" autoPlay loop muted playsInline />
                        ) : (
                          <img src={group.thumbnail_url} alt={group.name} className="collection-image" />
                        )
                      ) : (
                        <div
                          className="collection-placeholder"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
                        >
                          <div className="collection-emoji">
                            <ItemTypeIcon type={getItemType(group) || 'TICKET'} size={28} color="rgba(255,255,255,0.9)" />
                          </div>
                        </div>
                      )}
                      <div className="collection-overlay" />
                      <div className="collection-badge">{getBadgeName(group)}</div>
                    </div>
                    <div className="collection-info">
                      <div className="collection-title">{group.name}</div>
                      <div className="collection-meta">
                        {group.ticket_count}개 · 조회 {group.view_count}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 지금 인기 */}
            <div className="section-header" style={{ marginTop: '8px' }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={16} />
                지금 인기
              </div>
              <a href="/catalog" className="section-more">더보기</a>
            </div>

            <div style={{
              margin: '0 20px',
              background: 'var(--card)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}>
              {trendingGroups.length === 0 ? (
                <div style={{ padding: '24px 20px', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
                  데이터가 없습니다
                </div>
              ) : trendingGroups.map((group, index) => {
                const color = getItemTypeColor(group)
                return (
                  <div
                    key={group.id}
                    className="trending-item"
                    onClick={() => router.push(`/catalog/${group.id}`)}
                  >
                    <div className={`trending-rank ${index >= 3 ? 'dim' : ''}`}>{index + 1}</div>
                    <div className="trending-thumb">
                      {group.thumbnail_url ? (
                        group.thumbnail_url.endsWith('.mp4') ? (
                          <video src={group.thumbnail_url} className="trending-thumb-image" autoPlay loop muted playsInline />
                        ) : (
                          <img src={group.thumbnail_url} alt={group.name} className="trending-thumb-image" />
                        )
                      ) : (
                        <div
                          className="trending-thumb-placeholder"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
                        >
                          <ItemTypeIcon type={getItemType(group) || 'TICKET'} size={14} color="rgba(255,255,255,0.9)" />
                        </div>
                      )}
                    </div>
                    <div className="trending-info">
                      <div className="trending-title">{group.name}</div>
                      <div className="trending-meta">
                        {getBadgeName(group)} · {group.ticket_count}개
                      </div>
                    </div>
                    <div className="trending-count" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <TrendingUp size={12} />
                      {group.view_count}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 최근 등록 */}
            <div className="section-header" style={{ marginTop: '8px' }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                최근 등록
              </div>
              <a href="/catalog" className="section-more">전체보기</a>
            </div>

            <div className="grid-2" style={{ paddingBottom: '8px' }}>
              {recentGroups.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '24px 20px', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
                  데이터가 없습니다
                </div>
              ) : recentGroups.map((group) => {
                const color = getItemTypeColor(group)
                return (
                  <div
                    key={group.id}
                    className="collection-card collection-card-grid"
                    onClick={() => router.push(`/catalog/${group.id}`)}
                  >
                    <div className="collection-thumb">
                      {group.thumbnail_url ? (
                        group.thumbnail_url.endsWith('.mp4') ? (
                          <video src={group.thumbnail_url} className="collection-image" autoPlay loop muted playsInline />
                        ) : (
                          <img src={group.thumbnail_url} alt={group.name} className="collection-image" />
                        )
                      ) : (
                        <div
                          className="collection-placeholder"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
                        >
                          <div className="collection-emoji">
                            <ItemTypeIcon type={getItemType(group) || 'TICKET'} size={22} color="rgba(255,255,255,0.9)" />
                          </div>
                        </div>
                      )}
                      <div className="collection-overlay" />
                      <div className="collection-badge">{getBadgeName(group)}</div>
                    </div>
                    <div className="collection-info">
                      <div className="collection-title">{group.name}</div>
                      <div className="collection-meta">
                        {group.ticket_count}개 · 조회 {group.view_count}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {loading && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            불러오는 중...
          </div>
        )}
      </div>
    </>
  )
}
