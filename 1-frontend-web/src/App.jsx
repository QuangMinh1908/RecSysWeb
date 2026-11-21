import React, { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import SearchForm from './components/SearchForm'
import ProductFeed from './components/ProductFeed'
import SiteFooter from './components/SiteFooter'
import { searchRecommendation, fetchNextPage } from './services/api'
import { Sparkles } from 'lucide-react'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResponse, setSearchResponse] = useState(null)
  const [likedItems, setLikedItems] = useState([])
  const [lastQuery, setLastQuery] = useState(null)

  // Explicit manual search only (KHÔNG TỰ ĐỘNG CHẠY TÌM SẢN PHẨM)
  const handleSearch = async (query) => {
    setLoading(true)
    setError(null)
    setLastQuery(query)
    try {
      const data = await searchRecommendation(query)
      setSearchResponse(data)
    } catch (err) {
      console.error('Search error:', err)
      setError(err?.response?.data?.message || err.message || 'Lỗi khi gọi API tìm kiếm')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (newPage) => {
    if (!searchResponse?.sessionId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNextPage(searchResponse.sessionId, newPage)
      setSearchResponse(data)
      window.scrollTo({ top: 220, behavior: 'smooth' })
    } catch (err) {
      console.error('Page change error:', err)
      setError(err?.response?.data?.message || err.message || 'Lỗi khi chuyển trang')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = (itemId) => {
    setLikedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header with announcement */}
      <SiteHeader likedCount={likedItems.length} />

      {/* 2. Search Form (Chọn ngành hàng, snapshot, persona - không tự động chạy) */}
      <SearchForm onSearch={handleSearch} loading={loading} />

      {/* 3. Main Item Feed */}
      <main style={{ flex: 1 }}>
        {error ? (
          <div style={{ margin: '30px 3vw', padding: '30px', textAlign: 'center', background: 'var(--deep)', borderRadius: '4px' }}>
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>
            <button
              onClick={() => lastQuery && handleSearch(lastQuery)}
              className="ai-search-btn"
              style={{ marginTop: '12px' }}
            >
              Thử lại
            </button>
          </div>
        ) : searchResponse?.items && searchResponse.items.length > 0 ? (
          <ProductFeed
            items={searchResponse.items}
            randomItems={searchResponse.randomItems || []}
            page={searchResponse.page || 1}
            totalPages={searchResponse.totalPages || 1}
            totalItems={searchResponse.totalItems || 0}
            onPageChange={handlePageChange}
            loading={loading}
            likedItems={likedItems}
            onLike={handleToggleLike}
          />
        ) : !loading ? (
          /* Empty / Waiting state when user hasn't clicked search yet */
          <div
            style={{
              margin: '30px 3vw 60px',
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--dark)',
              border: '1px dashed var(--line)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'rgba(255, 173, 36, 0.15)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--orange)',
              }}
            >
              <Sparkles size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--ink)' }}>
              Sẵn sàng phân tích & gợi ý sản phẩm
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(247, 237, 219, 0.65)', maxWidth: '420px', marginInline: 'auto' }}>
              Vui lòng chọn ngành hàng, ngày dữ liệu và gu mua sắm ở trên, sau đó nhấn nút{' '}
              <strong style={{ color: 'var(--orange)' }}>"Tìm kiếm gợi ý AI"</strong> để xem kết quả.
            </p>
          </div>
        ) : null}
      </main>

      {/* 4. Footer */}
      <SiteFooter />
    </div>
  )
}
