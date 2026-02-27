interface QuickStatsProps {
  totalTickets: number
  totalCollections: number
  totalCollectors: number
  loading?: boolean
}

export default function QuickStats({
  totalTickets,
  totalCollections,
  totalCollectors,
  loading = false,
}: QuickStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const stats = [
    { value: formatNumber(totalTickets), label: '총 티켓 종류' },
    { value: formatNumber(totalCollections), label: '컬렉션' },
    { value: formatNumber(totalCollectors), label: '활성 컬렉터' },
  ]

  return (
    <div className="quick-stats anim anim-d1">
      {stats.map((stat, i) => (
        <div key={i} className="stat-box">
          <div className="stat-value">
            {loading ? '...' : stat.value}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
