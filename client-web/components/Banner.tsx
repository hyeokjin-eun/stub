'use client'

import { useState, useEffect, useRef } from 'react'
import { bannersApi } from '@/lib/api'
import type { Banner as BannerType } from '@/lib/api/types'

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002').replace(/\/api$/, '')

export default function Banner() {
  const [banners, setBanners] = useState<BannerType[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const data = await bannersApi.getAll()
      setBanners(data)
    } catch (error) {
      console.error('Failed to load banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    autoPlayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 3500)
  }

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }

  useEffect(() => {
    if (banners.length === 0) return
    startAutoPlay()
    return () => stopAutoPlay()
  }, [banners.length])

  if (loading || banners.length === 0) {
    return null
  }

  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    stopAutoPlay()
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50
    if (translateX > threshold && current > 0) {
      setCurrent(current - 1)
    } else if (translateX < -threshold && current < banners.length - 1) {
      setCurrent(current + 1)
    }

    setTranslateX(0)
    startAutoPlay()
  }

  return (
    <div className="banner-wrapper">
      <div
        className="banner-track"
        style={{
          transform: `translateX(calc(-${current * 100}% + ${translateX}px))`,
          transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {banners.map((banner) => {
          return (
            <div key={banner.id} className="banner-slide">
              {banner.image_url && (
                <img
                  src={banner.image_url?.startsWith('http') ? banner.image_url : `${BACKEND_BASE}${banner.image_url}`}
                  alt={banner.title}
                  className="banner-image"
                  draggable={false}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="banner-dots">
        {banners.map((_, i) => (
          <div
            key={i}
            className={`banner-dot ${i === current ? 'active' : ''}`}
            onClick={() => {
              setCurrent(i)
              stopAutoPlay()
              startAutoPlay()
            }}
          />
        ))}
      </div>
    </div>
  )
}
