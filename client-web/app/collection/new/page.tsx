'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Search, X, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { collectionsApi, stubsApi } from '@/lib/api'
import type { Stub } from '@/lib/api/types'

// ─── helpers ─────────────────────────────────────────────────────────────────

const parseTitle = (t: string) =>
  t?.match(/^OGT No\.\d+\s+(.+)\s+티켓$/)?.[1] ?? t

const CAT_COLOR: Record<string, string> = {
  MUSIC: 'c-purple', SPORTS: 'c-red', THEATER: 'c-teal',
  EXHIBITION: 'c-amber', CINEMA: 'c-navy', FESTIVAL: 'c-rose',
}
const CAT_GLOW: Record<string, string> = {
  MUSIC: '#7b2ff7', SPORTS: '#e03a3a', THEATER: '#00c8b0',
  EXHIBITION: '#c9a84c', CINEMA: '#2a4c9f', FESTIVAL: '#e74c78',
}
const CAT_ICON: Record<string, string> = {
  MUSIC: '🎤', SPORTS: '⚽', CINEMA: '🎬',
  THEATER: '🎭', EXHIBITION: '🎨', FESTIVAL: '🎪',
}
const color = (code?: string) => CAT_COLOR[code ?? ''] ?? 'c-navy'
const glow  = (code?: string) => CAT_GLOW[code ?? '']  ?? '#2a4c9f'
const icon  = (code?: string) => CAT_ICON[code ?? '']  ?? '🎫'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewCollectionPage() {
  const router = useRouter()

  const [step, setStep]          = useState<1 | 2>(1)
  const [name, setName]          = useState('')
  const [desc, setDesc]          = useState('')
  const [stubs, setStubs]        = useState<Stub[]>([])
  const [selected, setSelected]  = useState<Set<number>>(new Set())
  const [query, setQuery]        = useState('')
  const [loading, setLoading]    = useState(true)
  const [saving, setSaving]      = useState(false)

  useEffect(() => {
    stubsApi.getMyStubs()
      .then(setStubs).catch(() => setStubs([]))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const filtered = useMemo(() =>
    stubs.filter(s =>
      !query || parseTitle(s.catalog_item?.title ?? '').toLowerCase().includes(query.toLowerCase())
    ), [stubs, query])

  const selectedStubs = stubs.filter(s => selected.has(s.id))

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const col = await collectionsApi.create({ name: name.trim(), description: desc.trim() })
      await Promise.all(
        selectedStubs
          .filter(s => s.catalog_item_id != null)
          .map(s => collectionsApi.addItem(col.id, s.catalog_item_id!, s.id))
      )
      router.replace(`/collection/${col.id}`)
    } finally {
      setSaving(false)
    }
  }

  const stepTitle = step === 1 ? '새 컬렉션' : '티켓 선택'

  return (
    <div className="app-container">
      <main className="main-content" style={{ paddingBottom: 'calc(var(--nav-h) + 72px)' }}>

        {/* ── TopBar ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', color: 'var(--txt)', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, zIndex: 1 }}
            onClick={() => step === 1 ? router.back() : setStep(1)}
          >
            <ChevronLeft size={20} />
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--txt)',
            pointerEvents: 'none',
          }}>{stepTitle}</div>
          {/* 스텝 인디케이터 */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, zIndex: 1 }}>
            {[1, 2].map(n => (
              <div key={n} style={{
                width: n === step ? 18 : 6, height: 6, borderRadius: 3,
                background: n === step ? 'var(--gold)' : n < step ? 'var(--gold)' : 'var(--border)',
                transition: 'all .25s',
              }} />
            ))}
          </div>
        </div>

        {/* ── Step 1: 기본 정보 ── */}
        {step === 1 && (
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--txt-muted)', marginBottom: 24 }}>
              컬렉션의 이름과 설명을 입력하세요
            </div>

            <div className="section-label">컬렉션 이름 *</div>
            <input
              className="nc-input"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 영화관에서 본 영화들"
              style={{ marginBottom: 20, borderColor: name.trim() ? 'var(--gold)' : undefined }}
            />
            <div className="section-label">설명 (선택)</div>
            <input
              className="nc-input"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="간단히 설명해보세요"
              style={{ fontSize: 14 }}
            />

            {/* 다음 스텝 미리보기 */}
            <div
              style={{
                marginTop: 32, padding: '14px 16px',
                background: 'var(--card)', borderRadius: 12,
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: stubs.length === 0 ? 'pointer' : 'default',
              }}
              onClick={() => stubs.length === 0 ? router.push('/catalog') : undefined}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>티켓 선택</div>
                <div style={{ fontSize: 11, color: stubs.length === 0 ? 'var(--gold)' : 'var(--txt-muted)' }}>
                  {stubs.length > 0 ? `보유 티켓 ${stubs.length}개에서 선택` : '보유 티켓이 없어요 — 카탈로그에서 추가하기 →'}
                </div>
              </div>
              <ChevronRight size={16} color={stubs.length === 0 ? 'var(--gold)' : 'var(--txt-muted)'} />
            </div>
          </div>
        )}

        {/* ── Step 2: 티켓 선택 ── */}
        {step === 2 && (
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--txt-muted)' }}>
                보유 티켓에서 담을 티켓을 선택하세요
              </div>
              {selected.size > 0 && (
                <span style={{
                  fontSize: 11, fontFamily: 'DM Mono', color: 'var(--gold)',
                  background: 'rgba(201,168,76,.12)', padding: '3px 10px', borderRadius: 20,
                }}>
                  {selected.size}개 선택
                </span>
              )}
            </div>

            {/* 검색 */}
            <div className="nc-search-bar" style={{ marginBottom: 12 }}>
              <Search size={14} color="var(--txt-muted)" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="티켓 검색..."
              />
              {query && <X size={14} color="var(--txt-muted)" style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />}
            </div>

            {/* 선택된 티켓 프리뷰 */}
            {selectedStubs.length > 0 && (
              <div className="nc-preview-strip" style={{ marginBottom: 14 }}>
                {selectedStubs.map(stub => {
                  const code = stub.catalog_item?.category?.code
                  const img  = stub.image_url || stub.catalog_item?.image_url
                  return (
                    <div key={stub.id} className="nc-preview-thumb" onClick={() => toggle(stub.id)}>
                      <div className={color(code)} style={{ width: '100%', height: '100%' }}>
                        {img
                          ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>{icon(code)}</div>
                        }
                      </div>
                      <div className="nc-remove-dot"><X size={9} color="white" /></div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 티켓 그리드 */}
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>로딩 중...</div>
            ) : stubs.length === 0 ? (
              <EmptyTickets />
            ) : filtered.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: 13 }}>
                검색 결과가 없어요
              </div>
            ) : (
              <div className="nc-ticket-grid">
                {filtered.map(stub => (
                  <TicketCard
                    key={stub.id}
                    stub={stub}
                    selected={selected.has(stub.id)}
                    onToggle={() => toggle(stub.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 하단 버튼 ── */}
      <div className="nc-save-bar">
        {step === 1 ? (
          stubs.length === 0 ? (
            <button
              className="btn-primary"
              onClick={() => router.push('/catalog')}
              style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center' }}
            >
              카탈로그에서 티켓 추가하기 <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center' }}
            >
              다음 — 티켓 선택 <ChevronRight size={18} />
            </button>
          )
        ) : (
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center' }}
          >
            {saving ? '저장 중...' : (
              <><Check size={18} />{selected.size > 0 ? ` ${selected.size}개 담아서 ` : ' '}컬렉션 만들기</>
            )}
          </button>
        )}
      </div>

      <Navigation />
    </div>
  )
}

// ─── TicketCard ───────────────────────────────────────────────────────────────

function TicketCard({ stub, selected, onToggle }: {
  stub: Stub
  selected: boolean
  onToggle: () => void
}) {
  const code  = stub.catalog_item?.category?.code
  const title = parseTitle(stub.catalog_item?.title ?? '')
  const img   = stub.image_url || stub.catalog_item?.image_url

  return (
    <div className={`nc-ticket-card ${selected ? 'selected' : ''}`} onClick={onToggle}>
      <div className={color(code)} style={{ position: 'absolute', inset: 0 }}>
        {img ? (
          <img src={img} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: selected ? 1 : 0.75 }} />
        ) : (
          <>
            <div style={{
              position: 'absolute', width: 100, height: 100, borderRadius: '50%',
              background: glow(code), filter: 'blur(35px)', opacity: 0.4,
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 48,
            }}>
              {icon(code)}
            </div>
          </>
        )}
        <div className="nc-card-title">{title}</div>
      </div>
      {selected && (
        <>
          <div className="nc-select-overlay" />
          <div className="nc-check">
            <Check size={14} strokeWidth={3} color="#0a0800" />
          </div>
        </>
      )}
    </div>
  )
}

// ─── EmptyTickets ─────────────────────────────────────────────────────────────

function EmptyTickets() {
  const router = useRouter()
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      color: 'var(--txt-muted)', fontSize: 13, lineHeight: 1.8,
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎫</div>
      <div style={{ fontWeight: 600, color: 'var(--txt)', marginBottom: 4 }}>보유한 티켓이 없어요</div>
      <div style={{ fontSize: 12 }}>카탈로그에서 티켓을 먼저 등록해보세요</div>
      <button
        className="btn-primary"
        style={{ marginTop: 16, fontSize: 13 }}
        onClick={() => router.push('/catalog')}
      >
        카탈로그 보기
      </button>
    </div>
  )
}
