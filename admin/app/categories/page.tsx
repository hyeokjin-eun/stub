'use client'

import { useState, useEffect } from 'react'
import { adminApi, Category, CategoryUiConfig, ItemTypeUiConfig } from '@/lib/api'
import { Ticket, Tv, Layers, Gift, Star, Eye, EyeOff, ChevronDown, ChevronRight, RotateCcw, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'

const ITEM_TYPES = [
  { type: 'TICKET',       label: '티켓',   icon: Ticket },
  { type: 'VIEWING',      label: '관람',   icon: Tv     },
  { type: 'TRADING_CARD', label: '카드',   icon: Layers },
  { type: 'GOODS',        label: '굿즈',   icon: Gift   },
]

function IconBtn({ icon: Icon, active, color, title, onClick }: { icon: React.ElementType; active: boolean; color: string; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? `${color}20` : 'transparent', color: active ? color : 'var(--txt-3)', transition: 'all .12s' }}>
      <Icon size={13} />
    </button>
  )
}

function CatRow({ cat, depth, expanded, expandedIds, onToggle, onCfg, onReset }: {
  cat: Category; depth: number; expanded: boolean; expandedIds: Set<number>
  onToggle: (id: number) => void
  onCfg: (id: number, f: string, v: boolean) => void
  onReset: (id: number) => void
}) {
  const cfg = cat.ui_config ?? { is_default: false, skip_ui: false, auto_expand: false, show_in_filter: true }
  const hasChildren = !!cat.children?.length

  return (
    <>
      <tr style={{ background: depth === 0 ? 'var(--bg3)' : undefined }}>
        <td className="no-label" style={{ paddingLeft: 14 + depth * 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, cursor: hasChildren ? 'pointer' : 'default', color: 'var(--txt-3)', display: 'flex', alignItems: 'center' }}
              onClick={() => hasChildren && onToggle(cat.id)}>
              {hasChildren ? (expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : null}
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color || 'var(--border2)', flexShrink: 0 }} />
          </div>
        </td>
        <td data-label="카테고리">
          <div className="cell-name" style={{ fontSize: depth === 0 ? 13 : 12 }}>{cat.name}</div>
          <div className="cell-sub" style={{ fontFamily: 'DM Mono' }}>{cat.code}</div>
        </td>
        <td data-label="설정">
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconBtn icon={Star}        active={cfg.is_default}    color="#d4a84b" title="기본값"   onClick={() => onCfg(cat.id, 'is_default', !cfg.is_default)} />
            <IconBtn icon={EyeOff}      active={cfg.skip_ui}       color="#e05252" title="UI 숨김" onClick={() => onCfg(cat.id, 'skip_ui', !cfg.skip_ui)} />
            <IconBtn icon={ChevronDown} active={cfg.auto_expand}   color="#60a5fa" title="자동 펼침" onClick={() => onCfg(cat.id, 'auto_expand', !cfg.auto_expand)} />
            <IconBtn icon={Eye}         active={cfg.show_in_filter} color="#4ade80" title="필터 표시" onClick={() => onCfg(cat.id, 'show_in_filter', !cfg.show_in_filter)} />
            {cat.ui_config && (
              <button onClick={() => onReset(cat.id)} title="초기화" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--txt-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={11} />
              </button>
            )}
          </div>
        </td>
      </tr>
      {hasChildren && expanded && cat.children!.map(child => (
        <CatRow key={child.id} cat={child} depth={depth + 1} expanded={expandedIds.has(child.id)} expandedIds={expandedIds} onToggle={onToggle} onCfg={onCfg} onReset={onReset} />
      ))}
    </>
  )
}

export default function CategoriesPage() {
  const [tab, setTab]           = useState<'categories' | 'item-types'>('categories')
  const [itemType, setItemType] = useState('VIEWING')
  const [categories, setCategories] = useState<Category[]>([])
  const [itConfigs, setItConfigs]   = useState<ItemTypeUiConfig[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => { tab === 'categories' ? loadCats() : loadItConfigs() }, [tab, itemType])

  const loadItConfigs = async () => { setLoading(true); try { setItConfigs(await adminApi.allItemTypeConfigs()) } catch {} finally { setLoading(false) } }

  const loadCats = async () => {
    setLoading(true)
    try {
      const data: Category[] = await adminApi.categoriesTree(itemType)
      setCategories(data)
      setExpandedIds(new Set(data.map(c => c.id)))
    } catch {} finally { setLoading(false) }
  }

  const toggleExpand = (id: number) => setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const handleCfg = async (catId: number, field: string, value: boolean) => {
    try { await adminApi.updateUiConfig(catId, { [field]: value }); loadCats() }
    catch (e: any) { if (e.response?.status === 403) { alert('권한 없음'); window.location.href = '/login' } }
  }
  const handleReset = async (catId: number) => {
    if (!confirm('초기화할까요?')) return
    try { await adminApi.deleteUiConfig(catId); loadCats() } catch {}
  }
  const handleItCfg = async (type: string, field: string, value: boolean | number) => {
    try { await adminApi.updateItemTypeConfig(type, { [field]: value }); loadItConfigs() }
    catch (e: any) { if (e.response?.status === 403) { alert('권한 없음'); window.location.href = '/login' } }
  }

  return (
    <div>
      <div className="ph">
        <div><h1>카테고리 설정</h1><div className="ph-sub">카테고리 UI 플래그 및 필터 설정</div></div>
        <div className="ph-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => tab === 'categories' ? loadCats() : loadItConfigs()}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {(['categories', 'item-types'] as const).map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setTab(t)}>
            {t === 'categories' ? '카테고리 트리' : '아이템 타입'}
          </button>
        ))}
      </div>

      {/* Item type sub-tabs */}
      {tab === 'categories' && (
        <div className="tabs" style={{ marginBottom: 14 }}>
          {ITEM_TYPES.map(({ type, label, icon: Icon }) => (
            <button key={type} className={`tab ${itemType === type ? 'on' : ''}`} onClick={() => setItemType(type)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon size={11} />{label}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {[
          { icon: Star,        color: '#d4a84b', label: '기본값' },
          { icon: EyeOff,      color: '#e05252', label: 'UI 숨김' },
          { icon: ChevronDown, color: '#60a5fa', label: '자동 펼침' },
          { icon: Eye,         color: '#4ade80', label: '필터 표시' },
        ].map(({ icon: Icon, color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--txt-3)' }}>
            <Icon size={11} color={color} />{label}
          </div>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty"><div className="empty-title">로딩 중...</div></div>
        ) : tab === 'item-types' ? (
          <table className="tbl">
            <thead><tr><th>타입</th><th>설정</th><th>순서</th></tr></thead>
            <tbody>
              {itConfigs.map(cfg => {
                const t = ITEM_TYPES.find(t => t.type === cfg.item_type)
                if (!t) return null
                return (
                  <tr key={cfg.item_type} style={{ cursor: 'default' }}>
                    <td data-label="타입">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <t.icon size={14} color="var(--txt-3)" />
                        <div>
                          <div className="cell-name">{t.label}</div>
                          <div className="cell-sub" style={{ fontFamily: 'DM Mono' }}>{cfg.item_type}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="설정">
                      <div style={{ display: 'flex', gap: 2 }}>
                        <IconBtn icon={Star}   active={cfg.is_default}  color="#d4a84b" title="기본값" onClick={() => handleItCfg(cfg.item_type, 'is_default', !cfg.is_default)} />
                        <IconBtn icon={EyeOff} active={cfg.skip_ui}     color="#e05252" title="숨김"   onClick={() => handleItCfg(cfg.item_type, 'skip_ui', !cfg.skip_ui)} />
                        <IconBtn icon={Eye}    active={cfg.show_in_tab} color="#4ade80" title="탭 표시" onClick={() => handleItCfg(cfg.item_type, 'show_in_tab', !cfg.show_in_tab)} />
                      </div>
                    </td>
                    <td data-label="순서">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => handleItCfg(cfg.item_type, 'sort_order', cfg.sort_order - 1)} style={{ padding: 4, border: 'none', background: 'transparent', color: 'var(--txt-3)', cursor: 'pointer' }}><ArrowUp size={12} /></button>
                        <span className="cell-mono" style={{ minWidth: 20, textAlign: 'center' }}>{cfg.sort_order}</span>
                        <button onClick={() => handleItCfg(cfg.item_type, 'sort_order', cfg.sort_order + 1)} style={{ padding: 4, border: 'none', background: 'transparent', color: 'var(--txt-3)', cursor: 'pointer' }}><ArrowDown size={12} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <table className="tbl">
            <thead><tr><th style={{ width: 20 }}></th><th>카테고리</th><th>설정</th></tr></thead>
            <tbody>
              {categories.map(cat => (
                <CatRow key={cat.id} cat={cat} depth={0} expanded={expandedIds.has(cat.id)} expandedIds={expandedIds}
                  onToggle={toggleExpand} onCfg={handleCfg} onReset={handleReset} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
