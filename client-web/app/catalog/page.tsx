'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Bell, Search, Clock, TrendingUp, Hash, Ticket,
  Tv, Star, Layers, Gift, Film, Mic, Trophy, Palette,
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import CategoryFilter from '@/components/CategoryFilter'
import DynamicTitle from '@/components/DynamicTitle'
import { catalogGroupsApi, categoriesApi, catalogItemsApi, stubsApi, notificationsApi, appSettingsApi } from '@/lib/api'
import type { CatalogGroup, Category, ItemType, ItemTypeUiConfig } from '@/lib/api/types'

// item_type별 아이콘
const getItemTypeIcon = (itemType?: ItemType | null): React.ElementType => {
  const map: Record<string, React.ElementType> = {
    TICKET: Ticket,
    VIEWING: Tv,
    TRADING_CARD: Layers,
    GOODS: Gift,
  }
  return map[itemType ?? ''] ?? Ticket
}

// 카테고리 코드별 색상 (소분류 코드 기반)
const getCategoryColor = (code?: string): string => {
  const colorMap: Record<string, string> = {
    MEGABOX_OGT: 'c-navy',
    CGV_ART: 'c-red',
    MUSIC_CONCERT: 'c-purple',
    MUSICAL: 'c-teal',
    FESTIVAL: 'c-rose',
    BASEBALL: 'c-blue',
    SOCCER: 'c-amber',
    BASKETBALL: 'c-red',
    ART_EXHIBITION: 'c-teal',
    KDRAMA: 'c-rose',
    US_DRAMA: 'c-purple',
    JP_DRAMA: 'c-amber',
    ANIME_TV: 'c-amber',
    ANIME_MOVIE: 'c-red',
    POKEMON: 'c-amber',
    ONEPIECE_CARD: 'c-red',
    IDOL_GOODS: 'c-rose',
    ANIME_GOODS: 'c-amber',
  }
  return colorMap[code ?? ''] ?? 'c-navy'
}

const getGlowColor = (code?: string): string => {
  const map: Record<string, string> = {
    MEGABOX_OGT: '#2a4c9f',
    CGV_ART: '#e03a3a',
    MUSIC_CONCERT: '#7b2ff7',
    MUSICAL: '#00c8b0',
    FESTIVAL: '#e74c78',
    BASEBALL: '#0066ff',
    SOCCER: '#00cc44',
    BASKETBALL: '#ff6600',
    ART_EXHIBITION: '#00b894',
    KDRAMA: '#e91e63',
    US_DRAMA: '#9c27b0',
    JP_DRAMA: '#ff5722',
    ANIME_TV: '#ff9800',
    ANIME_MOVIE: '#ff5722',
    POKEMON: '#ffcc00',
    ONEPIECE_CARD: '#ea2024',
    IDOL_GOODS: '#ff6b6b',
    ANIME_GOODS: '#ff9800',
  }
  return map[code ?? ''] ?? '#2a4c9f'
}

type SortOption = 'popular' | 'latest' | 'order'

// item_type 탭 목록 (시네마 테마 색상)
const ITEM_TYPE_TABS: { type: ItemType; label: string; icon: React.ElementType; color: string }[] = [
  { type: 'TICKET', label: '티켓', icon: Ticket, color: '#c9a84c' },
  { type: 'VIEWING', label: '시청', icon: Tv, color: '#00c8b0' },
  { type: 'TRADING_CARD', label: '카드', icon: Layers, color: '#7b2ff7' },
  { type: 'GOODS', label: '굿즈', icon: Gift, color: '#e060a0' },
]

export default function CatalogPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [itemTypeConfigs, setItemTypeConfigs] = useState<ItemTypeUiConfig[]>([])
  const [activeItemType, setActiveItemType] = useState<ItemType | 'ALL'>('ALL')
  const [categoryTree, setCategoryTree] = useState<Category[]>([])       // 현재 탭의 대분류 트리
  const [activeCategoryDepth0, setActiveCategoryDepth0] = useState<string>('ALL') // 대분류
  const [activeCategoryDepth1, setActiveCategoryDepth1] = useState<string>('ALL') // 중분류
  const [activeCategoryDepth2, setActiveCategoryDepth2] = useState<string>('ALL') // 소분류
  const [groups, setGroups] = useState<CatalogGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [myStubs, setMyStubs] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [appTitle, setAppTitle] = useState('STUB')

  // 초기 로드: ItemType 설정 불러오기
  useEffect(() => {
    loadAppSettings()
    loadItemTypeConfigs()
    if (session?.user) {
      loadUnreadCount()
    }
  }, [session])

  const loadAppSettings = async () => {
    try {
      const settings = await appSettingsApi.getSettings()
      setAppTitle(settings.app_title || 'STUB')
    } catch (error) {
      console.error('Failed to load app settings:', error)
    }
  }

  // item_type 탭이 바뀔 때마다 카테고리 트리 + 그룹 재로드
  useEffect(() => {
    loadData()
  }, [activeItemType])

  const loadItemTypeConfigs = async () => {
    try {
      const configs = await categoriesApi.getItemTypeConfigs()
      setItemTypeConfigs(configs)

      // is_default인 타입을 찾아서 activeItemType으로 설정
      const defaultConfig = configs.find((c) => c.is_default)
      if (defaultConfig) {
        setActiveItemType(defaultConfig.item_type as ItemType)
      } else {
        // 기본값이 없으면 '전체'
        setActiveItemType('ALL')
      }
    } catch (error) {
      console.error('Failed to load item type configs:', error)
      setActiveItemType('ALL')
    }
  }

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)

      const itemType = activeItemType === 'ALL' ? undefined : activeItemType

      const [tree, groupsData] = await Promise.all([
        categoriesApi.getTree(itemType),
        catalogGroupsApi.getAll({ limit: 500, item_type: itemType }),
      ])

      setCategoryTree(tree)
      setGroups(groupsData.data)

      // ui_config 기반 자동 선택 로직
      const defaultRootCategory = tree.find((c) => c.ui_config?.is_default)

      if (defaultRootCategory) {
        setActiveCategoryDepth0(defaultRootCategory.code)

        // 중분류에서 is_default 찾기
        if (defaultRootCategory.children?.length) {
          const defaultMiddleCategory = defaultRootCategory.children.find((c) => c.ui_config?.is_default)

          if (defaultMiddleCategory) {
            setActiveCategoryDepth1(defaultMiddleCategory.code)

            // 소분류에서 is_default 찾기
            if (defaultMiddleCategory.children?.length) {
              const defaultLeafCategory = defaultMiddleCategory.children.find((c) => c.ui_config?.is_default)

              if (defaultLeafCategory) {
                setActiveCategoryDepth2(defaultLeafCategory.code)
              } else {
                setActiveCategoryDepth2('ALL')
              }
            } else {
              setActiveCategoryDepth2('ALL')
            }
          } else {
            setActiveCategoryDepth1('ALL')
            setActiveCategoryDepth2('ALL')
          }
        } else {
          setActiveCategoryDepth1('ALL')
          setActiveCategoryDepth2('ALL')
        }
      } else {
        setActiveCategoryDepth0('ALL')
        setActiveCategoryDepth1('ALL')
        setActiveCategoryDepth2('ALL')
      }

      if (session?.user) {
        const stubs = await stubsApi.getMyStubs().catch(() => [])
        setMyStubs(stubs.filter((s) => s.status === 'collected'))
      } else {
        setMyStubs([])
      }
    } catch (error) {
      console.error('Failed to load catalog data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 대분류 카테고리 목록 (depth=0) - show_in_filter 필터링
  const rootCategories: Category[] = [
    { id: 0, code: 'ALL', name: '전체', icon: '', color: '', depth: 0, parent_id: null, item_type: null, sort_order: 0, created_at: '' },
    ...categoryTree.filter((c) => c.ui_config?.show_in_filter !== false),
  ]

  // 중분류 카테고리 목록 (depth=1) - show_in_filter 필터링
  const selectedRootCategory = categoryTree.find((c) => c.code === activeCategoryDepth0)
  const middleCategories: Category[] = [
    { id: -1, code: 'ALL', name: '전체', icon: '', color: '', depth: 1, parent_id: null, item_type: null, sort_order: 0, created_at: '' },
    ...(selectedRootCategory?.children?.filter((c) => c.ui_config?.show_in_filter !== false) ?? []),
  ]

  // 소분류 카테고리 목록 (depth=2) - show_in_filter 필터링
  const selectedMiddleCategory = selectedRootCategory?.children?.find((c) => c.code === activeCategoryDepth1)
  const leafCategories: Category[] = [
    { id: -2, code: 'ALL', name: '전체', icon: '', color: '', depth: 2, parent_id: null, item_type: null, sort_order: 0, created_at: '' },
    ...(selectedMiddleCategory?.children?.filter((c) => c.ui_config?.show_in_filter !== false) ?? []),
  ]

  // skip_ui 체크 - 해당 depth의 필터를 숨길지 여부
  const shouldShowDepth0Filter = !categoryTree.some((c) => c.code === activeCategoryDepth0 && c.ui_config?.skip_ui)
  const shouldShowDepth1Filter = !selectedRootCategory?.children?.some((c) => c.code === activeCategoryDepth1 && c.ui_config?.skip_ui)
  const shouldShowDepth2Filter = !selectedMiddleCategory?.children?.some((c) => c.code === activeCategoryDepth2 && c.ui_config?.skip_ui)

  // ItemType 탭 동적 생성 (ui_config 기반)
  const itemTypeTabs = ITEM_TYPE_TABS
    .map((tab) => {
      const config = itemTypeConfigs.find((c) => c.item_type === tab.type)
      return { ...tab, config }
    })
    .filter((tab) => {
      // show_in_tab이 false면 숨김
      if (tab.config?.show_in_tab === false) return false
      // skip_ui이면 숨김 (자동 선택만 됨)
      if (tab.config?.skip_ui === true) return false
      return true
    })
    .sort((a, b) => {
      // sort_order 순서로 정렬
      const orderA = a.config?.sort_order ?? 0
      const orderB = b.config?.sort_order ?? 0
      return orderA - orderB
    })

  // "전체" 탭은 다른 탭이 2개 이상일 때만 추가
  const visibleItemTypeTabs: Array<{ type: ItemType | 'ALL'; label: string; icon: React.ElementType; color: string; config?: ItemTypeUiConfig }> =
    itemTypeTabs.length >= 2
      ? [{ type: 'ALL' as const, label: '전체', icon: Layers, color: 'var(--gold)' }, ...itemTypeTabs]
      : itemTypeTabs

  // 카테고리 필터링 로직
  const filteredGroups = groups.filter((g) => {
    // 그룹의 카테고리 정보 (소분류 = g.category)
    const leaf = g.category
    const middle = leaf?.parent
    const root = middle?.parent ?? middle

    // 대분류 필터
    if (activeCategoryDepth0 !== 'ALL' && root?.code !== activeCategoryDepth0) {
      return false
    }

    // 중분류 필터
    if (activeCategoryDepth1 !== 'ALL' && middle?.code !== activeCategoryDepth1) {
      return false
    }

    // 소분류 필터
    if (activeCategoryDepth2 !== 'ALL' && leaf?.code !== activeCategoryDepth2) {
      return false
    }

    return true
  })

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.view_count - a.view_count
      case 'latest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'order': return a.id - b.id
      default: return 0
    }
  })

  // 필터링된 결과 기반 동적 통계 계산
  const filteredGroupIds = new Set(filteredGroups.map(g => g.id))
  const totalFilteredTickets = filteredGroups.reduce((sum, g) => sum + g.ticket_count, 0)
  const myCollectedInFilter = myStubs.filter(stub => {
    const groupId = stub.catalog_item?.catalog_group_id
    return groupId && filteredGroupIds.has(groupId)
  }).length
  const myAchievement = totalFilteredTickets > 0 ? Math.round((myCollectedInFilter / totalFilteredTickets) * 100) : 0

  const stats = {
    totalGroups: filteredGroups.length,
    totalTickets: totalFilteredTickets,
    myCollected: myCollectedInFilter,
    myAchievement,
  }

  return (
    <>
      <DynamicTitle pageName="카탈로그" />
      <div className="app-container">
        <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 16px)' }}>

          {/* Header */}
          <header className="cat-app-header anim">
            <div className="logo">{appTitle}<span>BOOK</span></div>
            <div className="header-actions">
              <div className="icon-btn" onClick={() => router.push('/search')}><Search size={20} /></div>
              <div className="icon-btn" onClick={() => router.push('/notifications')} style={{ position: 'relative' }}>
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

          {/* Stats Strip */}
          <div className="stats-strip anim anim-d1">
            <div className="stat-item">
              <div className="stat-val">{stats.totalGroups}</div>
              <div className="stat-lbl">그룹</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">{stats.totalTickets}</div>
            <div className="stat-lbl">전체 수집품</div>
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
          <div id="banner-ad-slot" className="anim anim-d2">
            <span className="ad-placeholder-text">광고 연결 영역</span>
          </div>

          {/* item_type 탭 - ui_config 기반 동적 표시 */}
          {visibleItemTypeTabs.length > 1 && (
            <div className="chip-scroll anim anim-d2" style={{ paddingTop: '14px' }}>
              {visibleItemTypeTabs.map(({ type, label, icon: Icon, color }) => {
                const isActive = activeItemType === type
                const bgColor = color
                // 활성화 시 글자색: 골드(ALL, TICKET)는 어두운 배경색, 나머지는 아이보리
                const activeTextColor = type === 'TICKET' || type === 'ALL' ? '#0a0a0a' : '#f0ece4'

                return (
                  <div
                    key={type}
                    onClick={() => setActiveItemType(type)}
                    style={{
                      flexShrink: 0,
                      padding: '7px 16px',
                      borderRadius: '20px',
                      background: isActive ? bgColor : 'var(--card)',
                      border: `1px solid ${isActive ? bgColor : 'var(--border)'}`,
                      fontSize: '12px',
                      color: isActive ? activeTextColor : 'var(--txt-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    <Icon size={13} style={{ marginRight: 4 }} color={isActive ? activeTextColor : 'var(--txt-muted)'} />
                    {label}
                  </div>
                )
              })}
            </div>
          )}

          {/* 대분류 카테고리 필터 - skip_ui 체크 */}
          {shouldShowDepth0Filter && rootCategories.length > 1 && (
            <div className="anim anim-d2" style={{ paddingTop: '8px' }}>
              <CategoryFilter
                categories={rootCategories}
                activeCategory={activeCategoryDepth0}
                onCategoryChange={(code) => {
                  setActiveCategoryDepth0(code)
                  setActiveCategoryDepth1('ALL')
                  setActiveCategoryDepth2('ALL')
                }}
              />
            </div>
          )}

          {/* 중분류 카테고리 필터 - skip_ui 체크 */}
          {shouldShowDepth1Filter && activeCategoryDepth0 !== 'ALL' && middleCategories.length > 1 && (
            <div className="anim anim-d2" style={{ paddingTop: '8px' }}>
              <CategoryFilter
                categories={middleCategories}
                activeCategory={activeCategoryDepth1}
                onCategoryChange={(code) => {
                  setActiveCategoryDepth1(code)
                  setActiveCategoryDepth2('ALL')
                }}
              />
            </div>
          )}

          {/* 소분류 카테고리 필터 - skip_ui 체크 */}
          {shouldShowDepth2Filter && activeCategoryDepth1 !== 'ALL' && leafCategories.length > 1 && (
            <div className="anim anim-d2" style={{ paddingTop: '8px' }}>
              <CategoryFilter
                categories={leafCategories}
                activeCategory={activeCategoryDepth2}
                onCategoryChange={setActiveCategoryDepth2}
              />
            </div>
          )}

          {/* Sort Row */}
          <div className="sort-row anim anim-d3">
            <div className="result-count">그룹 <strong>{sortedGroups.length}</strong>개</div>
            <div className="sort-btn-wrapper" style={{ position: 'relative' }}>
              <div className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
                {sortBy === 'popular' && <><TrendingUp size={12} />인기순</>}
                {sortBy === 'latest' && <><Clock size={12} />최신순</>}
                {sortBy === 'order' && <><Hash size={12} />번호순</>}
              </div>
              {showSortMenu && (
                <div className="sort-menu">
                  {(['popular', 'latest', 'order'] as const).map((opt) => (
                    <div
                      key={opt}
                      className={`sort-menu-item ${sortBy === opt ? 'active' : ''}`}
                      onClick={() => { setSortBy(opt); setShowSortMenu(false) }}
                    >
                      {opt === 'popular' && <><TrendingUp size={14} />인기순</>}
                      {opt === 'latest' && <><Clock size={14} />최신순</>}
                      {opt === 'order' && <><Hash size={14} />번호순</>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Catalog Content */}
          <div id="catalog-content" className="anim anim-d4" style={{ padding: '16px 12px 0' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>불러오는 중...</div>
            ) : sortedGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>그룹이 없습니다</div>
            ) : (
              <div className="group-grid">
                {sortedGroups.map((group) => (
                  <GroupCard key={group.id} group={group} onClick={() => router.push(`/catalog/${group.id}`)} />
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
  const isHot = group.view_count > 500
  const isNew = new Date(group.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  // 소분류 code 기준으로 색상 결정
  const categoryCode = group.category?.code

  // item_type 아이콘 (대분류의 item_type)
  const rootItemType = group.category?.parent?.parent?.item_type ?? group.category?.parent?.item_type ?? null
  const ItemTypeIcon = getItemTypeIcon(rootItemType)

  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-thumb">
        <div className={`group-thumb-bg ${getCategoryColor(categoryCode)}`}>
          <div className="group-glow" style={{ background: getGlowColor(categoryCode) }} />
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
            <div className="group-emoji"><ItemTypeIcon size={28} /></div>
          )}
        </div>
        <div className="badge-row">
          <div className="badge badge-cat">{group.category?.name ?? 'OTHER'}</div>
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

