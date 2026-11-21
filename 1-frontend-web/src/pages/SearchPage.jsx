import React, { useState } from 'react'
import SearchForm from '../components/SearchForm'
import ResultGrid from '../components/ResultGrid'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { searchRecommendation, fetchNextPage } from '../services/api'
import { Zap, Cpu, ShieldCheck } from 'lucide-react'

export default function SearchPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResponse, setSearchResponse] = useState(null)
  const [lastQuery, setLastQuery] = useState(null)

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
      window.scrollTo({ top: 300, behavior: 'smooth' })
    } catch (err) {
      console.error('Page change error:', err)
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải trang mới từ cache')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Header Banner */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-red-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              S
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Shopee Temporal RecSys
              </h1>
              <p className="text-[11px] text-gray-500">
                Multi-Stream Tensor Fusion & GRU Compressor (M4_GRU)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Model M4_GRU v1.0
            </span>
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
              <Cpu className="w-3.5 h-3.5" /> Virtual Threads Serving
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Search Form with 3 inputs */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* State rendering */}
        {error ? (
          <ErrorState error={error} onRetry={() => lastQuery && handleSearch(lastQuery)} />
        ) : searchResponse?.items && searchResponse.items.length > 0 ? (
          <ResultGrid
            items={searchResponse.items}
            randomItems={searchResponse.randomItems || []}
            page={searchResponse.page}
            totalPages={searchResponse.totalPages}
            totalItems={searchResponse.totalItems}
            onPageChange={handlePageChange}
            loading={loading}
          />
        ) : !loading ? (
          <EmptyState />
        ) : null}
      </main>
    </div>
  )
}
