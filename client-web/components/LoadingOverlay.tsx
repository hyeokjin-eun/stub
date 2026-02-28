'use client'

import { useState, useEffect } from 'react'

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => setIsLoading((e as CustomEvent<boolean>).detail)
    window.addEventListener('api-loading', handler)
    return () => window.removeEventListener('api-loading', handler)
  }, [])

  if (!isLoading) return null

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
    </div>
  )
}
