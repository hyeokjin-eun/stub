'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ticket } from 'lucide-react'

interface TicketCardProps {
  id: number
  number: string
  category: string
  title: string
  date: string
  venue?: string
  collector: {
    name: string
    avatar: string
    color: string
  }
  likes: number
  color: string
  grade?: string
  wide?: boolean
}

export default function TicketCard({
  id,
  number,
  category,
  title,
  date,
  venue,
  collector,
  likes: initialLikes,
  color,
  grade,
  wide,
}: TicketCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  const cardClass = `tg-card c-${color} ${wide ? 'collection-card-wide' : ''}`

  return (
    <Link href={`/catalog/${id}`} className={cardClass}>
      <div className="tg-inner">
        <div className="tg-glow" style={{ background: getGlowColor(color) }} />
        <div className="tg-emoji">
          <Ticket size={wide ? 64 : 52} strokeWidth={1.6} />
        </div>
        {grade && <div className="tg-grade">{grade}</div>}
      </div>
      <div className="tg-foot">
        <div className="tg-num">
          {number} · {category}
        </div>
        <div className="tg-name">{title}</div>
        <div className="tg-date">
          {date}
          {venue && ` · ${venue}`}
        </div>
        <div className="tg-collector-row">
          <div className="tg-collector">
            <div className="tg-avatar" style={{ background: collector.color, color: '#fff' }}>
              {collector.avatar}
            </div>
            <span className="tg-nick">{collector.name}</span>
          </div>
          <span className={`tg-like ${liked ? 'liked' : ''}`} onClick={handleLike}>
            {liked ? '♥' : '♡'} {likes}
          </span>
        </div>
      </div>
    </Link>
  )
}

function getGlowColor(color: string): string {
  const colors: Record<string, string> = {
    purple: '#7b2ff7',
    red: '#e03a3a',
    teal: '#00c8b0',
    navy: '#2a4c9f',
    amber: '#f0a020',
    green: '#20a050',
    rose: '#e74c78',
    sky: '#3ba8d8',
  }
  return colors[color] || colors.purple
}
