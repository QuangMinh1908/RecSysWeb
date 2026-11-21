import React, { useState, useEffect } from 'react'
import ItemCard from './ItemCard'
import { ChevronLeft, ChevronRight, Sparkles, Database } from 'lucide-react'

export default function ResultGrid({
  items = [],
  randomItems = [],
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  loading,
}) {
  const [baselinePage, setBaselinePage] = useState(1)
  const BASELINE_PAGE_SIZE = 8

  // Reset baseline page when search result changes
  useEffect(() => {
    setBaselinePage(1)
  }, [items, randomItems])

  if (!items || items.length === 0) return null

  const baselineTotalItems = randomItems ? randomItems.length : 0
  const baselineTotalPages = Math.max(1, Math.ceil(baselineTotalItems / BASELINE_PAGE_SIZE))
  const currentBaselineItems = (randomItems || []).slice(
    (baselinePage - 1) * BASELINE_PAGE_SIZE,
    baselinePage * BASELINE_PAGE_SIZE
  )

  return (
    <div className="space-y-6">
      {/* 2-Column Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / LARGER PORTION: Model Recommendations (Khoanh xanh nổi bật) */}
        <section className="lg:col-span-8 xl:col-span-8 bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-sm ring-4 ring-blue-50/60 transition-all">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Sản phẩm gợi ý qua AI Model</span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    M4_GRU Temporal RecSys
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Backend sắp xếp giảm dần theo điểm CTR dự đoán từ Model cho Persona
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-gray-600 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100">
              <span className="font-semibold text-blue-900">{totalItems}</span> sản phẩm • Trang{' '}
              <span className="font-bold text-blue-600">{page}</span>/{totalPages}
            </div>
          </div>

          {/* Model Items Grid (4 columns on lg screens) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 mb-6">
            {items.map((item) => (
              <ItemCard key={`model-${item.itemId}`} item={item} isRandom={false} />
            ))}
          </div>

          {/* Pagination Controls for Model Section */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-gray-100">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev && p - prev > 1

                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-gray-400 text-xs">...</span>}
                      <button
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          p === page
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  )
                })}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Sau <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* RIGHT PORTION: Database Baseline with Full Items & Pagination (Đối chứng gốc) */}
        <section className="lg:col-span-4 xl:col-span-4 bg-gray-50/80 border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Dữ liệu gốc từ Database</span>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                      Toàn bộ {baselineTotalItems} SP
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Thứ tự lưu trữ tuần tự trong DB (chưa qua AI)
                  </p>
                </div>
              </div>
            </div>

            {/* Baseline Items Grid */}
            {currentBaselineItems && currentBaselineItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {currentBaselineItems.map((item) => (
                  <ItemCard
                    key={`baseline-${item.itemId}`}
                    item={item}
                    isRandom={false}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-gray-400">
                Chưa có dữ liệu gốc đối chứng
              </div>
            )}
          </div>

          {/* Pagination Controls for Database Section */}
          {baselineTotalPages > 1 && (
            <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500">
                Trang <span className="font-semibold text-gray-700">{baselinePage}</span> / {baselineTotalPages} (8 SP/trang)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBaselinePage((p) => Math.max(1, p - 1))}
                  disabled={baselinePage <= 1}
                  className="px-2 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>

                {Array.from({ length: baselineTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={`b-page-${p}`}
                    onClick={() => setBaselinePage(p)}
                    className={`w-6 h-6 rounded text-xs font-medium transition ${
                      p === baselinePage
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-white border border-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setBaselinePage((p) => Math.min(baselineTotalPages, p + 1))}
                  disabled={baselinePage >= baselineTotalPages}
                  className="px-2 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
