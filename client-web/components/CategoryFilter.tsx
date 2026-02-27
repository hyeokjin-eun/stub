'use client'

import type { Category } from '@/lib/api/types'

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (code: string) => void
  className?: string
  style?: React.CSSProperties
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  className = '',
  style,
}: CategoryFilterProps) {
  return (
    <div className={`chip-scroll ${className}`} style={style}>
      {categories.map((category) => (
        <div
          key={category.id}
          className={`chip ${activeCategory === category.code ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.code)}
        >
          {category.name}
        </div>
      ))}
    </div>
  )
}
