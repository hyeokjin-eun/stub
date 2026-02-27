'use client'

import { useEffect, useState } from 'react'
import { categoriesApi, catalogItemsApi } from '@/lib/api'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function testApis() {
      try {
        console.log('Testing direct fetch to backend...')

        // Test 1: Direct fetch
        const directResponse = await fetch('http://localhost:3002/categories')
        const directData = await directResponse.json()
        console.log('✅ Direct fetch success:', directData)

        // Test 2: API client categories
        const categoriesData = await categoriesApi.getAll()
        console.log('✅ Categories API success:', categoriesData)

        // Test 3: API client catalog items
        const catalogData = await catalogItemsApi.getAll({ limit: 5 })
        console.log('✅ Catalog API success:', catalogData)

        setResults({
          direct: directData,
          categories: categoriesData,
          catalog: catalogData,
        })
      } catch (err: any) {
        console.error('❌ API Test failed:', err)
        setError(err.message || String(err))
      }
    }

    testApis()
  }, [])

  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>API Connection Test</h1>

      {error && (
        <div style={{ background: '#f00', padding: '10px', margin: '10px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ background: '#222', padding: '20px', margin: '20px 0' }}>
        <h2>Results:</h2>
        <pre style={{ overflow: 'auto' }}>{JSON.stringify(results, null, 2)}</pre>
      </div>

      <div style={{ background: '#222', padding: '20px', margin: '20px 0' }}>
        <h2>Instructions:</h2>
        <p>Open browser console (F12) to see detailed logs</p>
        <p>Backend should be running on http://localhost:3002</p>
      </div>
    </div>
  )
}
