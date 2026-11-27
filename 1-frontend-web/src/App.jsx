import { useState } from 'react'
import { ArrowDownRight, CircleAlert, LoaderCircle, Search } from 'lucide-react'
import HeroProducts from './components/HeroProducts'
import SiteHeader from './components/SiteHeader'
import SearchForm from './components/SearchForm'
import ProductFeed from './components/ProductFeed'
import SiteFooter from './components/SiteFooter'
import { searchRecommendation, fetchNextPage } from './services/api'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResponse, setSearchResponse] = useState(null)
  const [likedItems, setLikedItems] = useState([])

  const scrollToResults = () => {
    requestAnimationFrame(() => {
      document.getElementById('results-title')?.focus({ preventScroll: true })
      document.getElementById('shop')?.scrollIntoView()
    })
  }

  const handleSearch = async (query) => {
    setLoading(true)
    setError(null)
    try {
      setSearchResponse(await searchRecommendation(query))
      scrollToResults()
    } catch (err) {
      setError({ message: err?.response?.data?.message || 'Không thể tải kết quả tìm kiếm.', retry: () => handleSearch(query) })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (page) => {
    if (!searchResponse?.sessionId) return
    setLoading(true)
    setError(null)
    try {
      setSearchResponse(await fetchNextPage(searchResponse.sessionId, page))
      scrollToResults()
    } catch (err) {
      setError({ message: err?.response?.data?.message || 'Không thể tải trang kết quả này.', retry: () => handlePageChange(page) })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = (itemId) => {
    setLikedItems((items) => items.includes(itemId) ? items.filter((id) => id !== itemId) : [...items, itemId])
  }

  const hasResults = searchResponse?.items?.length > 0

  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <SiteHeader likedCount={likedItems.length} />

      <main id="main-content" tabIndex={-1}>
        <section className="catalog-hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span>Tìm đúng món.</span>
              <span>Hợp gu bạn.</span>
            </h1>
            <a className="hero-link" href="#filters">Khám phá sản phẩm <ArrowDownRight size={19} aria-hidden="true" /></a>
          </div>
          <HeroProducts />
        </section>

        <section className="filter-section wrap" id="filters" aria-labelledby="filter-title">
          <h2 className="filter-title" id="filter-title">Bộ lọc</h2>
          <SearchForm onSearch={handleSearch} loading={loading} />
        </section>

        <div className="results-band">
          <section className="results-section wrap" id="shop" aria-labelledby="results-title" aria-busy={loading}>
            <div className="results-heading">
              <h2 id="results-title" tabIndex={-1}>Sản phẩm</h2>
              {hasResults && <p role="status">{(searchResponse.totalItems ?? searchResponse.items.length).toLocaleString('vi-VN')} sản phẩm</p>}
            </div>

            {error && (
              <div className="results-message results-error" role="alert">
                <CircleAlert size={22} aria-hidden="true" />
                <p>{error.message}</p>
                <button className="secondary-button" type="button" onClick={error.retry}>Thử lại</button>
              </div>
            )}

            {hasResults ? (
              <ProductFeed
                key={searchResponse.sessionId}
                items={searchResponse.items}
                randomItems={searchResponse.randomItems || []}
                page={searchResponse.page}
                totalPages={searchResponse.totalPages}
                onPageChange={handlePageChange}
                loading={loading}
                likedItems={likedItems}
                onLike={handleToggleLike}
              />
            ) : !error && (
              <div className="results-message empty-results" role="status">
                {loading ? <LoaderCircle className="spinner" size={24} aria-hidden="true" /> : <Search size={24} aria-hidden="true" />}
                <div>
                  <strong>{loading ? 'Đang tìm sản phẩm…' : searchResponse ? 'Không tìm thấy sản phẩm' : 'Chọn bộ lọc để xem sản phẩm'}</strong>
                  {!loading && searchResponse && <p>Thử chọn ngành hàng hoặc ngày khác.</p>}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
