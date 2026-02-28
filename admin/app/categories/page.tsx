'use client'

import { useState, useEffect } from 'react'
import { adminApi, Category, CategoryUiConfig, ItemTypeUiConfig } from '@/lib/api'
import BottomNav from '@/components/BottomNav'
import {
  Ticket, Tv, Layers, Gift,
  Star, Eye, EyeOff, ChevronRight, ChevronDown,
  ArrowUp, ArrowDown, RotateCcw,
} from 'lucide-react'

const ITEM_TYPE_TABS = [
  { type: 'TICKET',       label: '티켓',   icon: Ticket },
  { type: 'VIEWING',      label: '관람',   icon: Tv     },
  { type: 'TRADING_CARD', label: '카드',   icon: Layers },
  { type: 'GOODS',        label: '굿즈',   icon: Gift   },
]

/* ─── Legend Item ─── */
function LegendDot({ icon: Icon, color, label }: { icon: React.ElementType; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--txt-muted)' }}>
      <Icon size={12} color={color} />
      {label}
    </div>
  )
}

/* ─── Icon Toggle Button ─── */
function IconBtn({
  icon: Icon, active, activeColor, title, onClick
}: { icon: React.ElementType; active: boolean; activeColor: string; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? `${activeColor}22` : 'transparent',
        color: active ? activeColor : 'var(--txt-muted)',
        transition: 'all .15s',
      }}
    >
      <Icon size={15} fill={Icon === Star && active ? activeColor : 'none'} />
    </button>
  )
}

/* ─── Category Tree Item ─── */
function CategoryItem({
  category, depth, expanded, expandedIds,
  onToggleExpand, onConfigChange, onResetConfig,
}: {
  category: Category; depth: number; expanded: boolean; expandedIds: Set<number>
  onToggleExpand: (id: number) => void
  onConfigChange: (id: number, field: string, value: boolean) => void
  onResetConfig: (id: number) => void
}) {
  const cfg = category.ui_config ?? { is_default: false, skip_ui: false, auto_expand: false, show_in_filter: true }
  const hasChildren = !!category.children?.length

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: `12px ${12 + depth * 20}px 12px 12px`,
        borderBottom: '1px solid var(--border)',
        background: depth === 0 ? 'var(--bg2)' : 'var(--card)',
        transition: 'background .1s',
      }}>
        {/* Expand toggle */}
        <div
          style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default', color: 'var(--txt-muted)', flexShrink: 0 }}
          onClick={() => hasChildren && onToggleExpand(category.id)}
        >
          {hasChildren
            ? (expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)
            : <div style={{ width: 15 }} />}
        </div>

        {/* Color dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: category.color || 'var(--border)', flexShrink: 0 }} />

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: depth === 0 ? 700 : 500, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {category.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--txt-muted)', fontFamily: 'DM Mono' }}>
            {category.code}
          </div>
        </div>

        {/* Config toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <IconBtn icon={Star}    active={cfg.is_default}    activeColor="#c9a84c" title="기본 선택" onClick={() => onConfigChange(category.id, 'is_default', !cfg.is_default)} />
          <IconBtn icon={EyeOff}  active={cfg.skip_ui}       activeColor="#e03a3a" title="UI 숨김"   onClick={() => onConfigChange(category.id, 'skip_ui', !cfg.skip_ui)} />
          <IconBtn icon={ChevronDown} active={cfg.auto_expand} activeColor="#4f9cf9" title="자동 펼침" onClick={() => onConfigChange(category.id, 'auto_expand', !cfg.auto_expand)} />
          <IconBtn icon={Eye}     active={cfg.show_in_filter} activeColor="#2ecc71" title="필터 표시" onClick={() => onConfigChange(category.id, 'show_in_filter', !cfg.show_in_filter)} />
          {category.ui_config && (
            <button
              onClick={() => onResetConfig(category.id)}
              title="초기화"
              style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--txt-muted)' }}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && category.children!.map(child => (
        <CategoryItem
          key={child.id} category={child} depth={depth + 1}
          expanded={expandedIds.has(child.id)} expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onConfigChange={onConfigChange}
          onResetConfig={onResetConfig}
        />
      ))}
    </div>
  )
}

/* ─── Main Page ─── */
export default function CategoriesPage() {
  const [activeTab, setActiveTab]         = useState<'item-types' | 'categories'>('categories')
  const [activeItemType, setActiveItemType] = useState('VIEWING')
  const [categories, setCategories]       = useState<Category[]>([])
  const [itemTypeConfigs, setItemTypeConfigs] = useState<ItemTypeUiConfig[]>([])
  const [expandedIds, setExpandedIds]     = useState<Set<number>>(new Set())
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (activeTab === 'categories') loadCategories()
    else loadItemTypeConfigs()
  }, [activeTab, activeItemType])

  const loadItemTypeConfigs = async () => {
    setLoading(true)
    try { setItemTypeConfigs(await adminApi.allItemTypeConfigs()) }
    catch {}
    finally { setLoading(false) }
  }

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data: Category[] = await adminApi.categoriesTree(activeItemType)
      setCategories(data)
      setExpandedIds(new Set(data.map((c: Category) => c.id)))
    } catch {}
    finally { setLoading(false) }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const handleConfigChange = async (categoryId: number, field: string, value: boolean) => {
    try {
      await adminApi.updateUiConfig(categoryId, { [field]: value })
      loadCategories()
    } catch (e: any) {
      if (e.response?.status === 403) { alert('권한 없음'); window.location.href = '/login' }
      else alert('업데이트 실패')
    }
  }

  const handleResetConfig = async (categoryId: number) => {
    if (!confirm('초기화할까요?')) return
    try { await adminApi.deleteUiConfig(categoryId); loadCategories() }
    catch {}
  }

  const handleItemTypeConfigChange = async (itemType: string, field: string, value: boolean | number) => {
    try {
      await adminApi.updateItemTypeConfig(itemType, { [field]: value })
      loadItemTypeConfigs()
    } catch (e: any) {
      if (e.response?.status === 403) { alert('권한 없음'); window.location.href = '/login' }
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-main">

        {/* Header */}
        <div style={{ padding: '16px 16px 10px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '.06em' }}>
          카테고리 <span style={{ color: 'var(--gold)' }}>설정</span>
        </div>

        {/* Main Tab */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
          {(['categories', 'item-types'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`a-btn ${activeTab === tab ? 'a-btn-primary' : 'a-btn-ghost'}`}
              style={{ flex: 1, padding: '9px 12px', fontSize: 13 }}
            >
              {tab === 'categories' ? '카테고리' : '아이템 타입'}
            </button>
          ))}
        </div>

        {/* Item Type Sub-tabs (categories 탭일 때) */}
        {activeTab === 'categories' && (
          <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '0 16px 12px', scrollbarWidth: 'none' }}>
            {ITEM_TYPE_TABS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setActiveItemType(type)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid var(--border)',
                  background: activeItemType === type ? 'var(--gold)' : 'var(--card)',
                  color: activeItemType === type ? '#0a0800' : 'var(--txt-muted)',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 16px 12px' }}>
          <LegendDot icon={Star}        color="#c9a84c" label="기본 선택" />
          <LegendDot icon={EyeOff}      color="#e03a3a" label="UI 숨김"   />
          {activeTab === 'categories' ? (
            <>
              <LegendDot icon={ChevronDown} color="#4f9cf9" label="자동 펼침" />
              <LegendDot icon={Eye}         color="#2ecc71" label="필터 표시" />
            </>
          ) : (
            <LegendDot icon={Eye} color="#2ecc71" label="탭 표시" />
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="a-empty"><div className="a-empty-title">로딩 중...</div></div>
        ) : activeTab === 'item-types' ? (

          /* ── Item Type Config ── */
          <div style={{ margin: '0 16px' }}>
            <div className="a-list">
              {itemTypeConfigs.map(config => {
                const tab = ITEM_TYPE_TABS.find(t => t.type === config.item_type)
                if (!tab) return null
                const Icon = tab.icon
                return (
                  <div key={config.item_type} className="a-row" style={{ cursor: 'default' }}>
                    <div className="a-row-icon"><Icon size={18} /></div>
                    <div className="a-row-body">
                      <div className="a-row-title">{tab.label}</div>
                      <div className="a-row-sub" style={{ fontFamily: 'DM Mono' }}>{config.item_type}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconBtn icon={Star}   active={config.is_default}  activeColor="#c9a84c" title="기본값" onClick={() => handleItemTypeConfigChange(config.item_type, 'is_default', !config.is_default)} />
                      <IconBtn icon={EyeOff} active={config.skip_ui}     activeColor="#e03a3a" title="탭 숨김" onClick={() => handleItemTypeConfigChange(config.item_type, 'skip_ui', !config.skip_ui)} />
                      <IconBtn icon={Eye}    active={config.show_in_tab} activeColor="#2ecc71" title="탭 표시" onClick={() => handleItemTypeConfigChange(config.item_type, 'show_in_tab', !config.show_in_tab)} />
                      {/* Sort order */}
                      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 4 }}>
                        <button onClick={() => handleItemTypeConfigChange(config.item_type, 'sort_order', config.sort_order - 1)}
                          style={{ padding: '2px 4px', border: 'none', background: 'transparent', color: 'var(--txt-muted)', cursor: 'pointer' }}>
                          <ArrowUp size={12} />
                        </button>
                        <button onClick={() => handleItemTypeConfigChange(config.item_type, 'sort_order', config.sort_order + 1)}
                          style={{ padding: '2px 4px', border: 'none', background: 'transparent', color: 'var(--txt-muted)', cursor: 'pointer' }}>
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--txt-muted)', minWidth: 16, textAlign: 'center' }}>{config.sort_order}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        ) : (

          /* ── Category Tree ── */
          <div style={{ margin: '0 16px' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {categories.map(rootCat => (
                <CategoryItem
                  key={rootCat.id} category={rootCat} depth={0}
                  expanded={expandedIds.has(rootCat.id)} expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                  onConfigChange={handleConfigChange}
                  onResetConfig={handleResetConfig}
                />
              ))}
            </div>
          </div>

        )}
      </div>
      <BottomNav />
    </div>
  )
}
