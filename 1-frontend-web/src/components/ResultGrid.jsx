import React from 'react'
import ItemCard from './ItemCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ResultGrid({ items = [], page = 1, totalPages = 1, totalItems = 0, onPageChange, loading }) {
  if (!items || items.length === 0) return null

  return (
    <div>
      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between mb-4 gap-2">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <span>Kết quả gợi ý xếp hạng</span>
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {totalItems} sản phẩm
          </span>
        </h3>
        <p className="text-xs text-gray-500">
          Hiển thị trang <span className="font-semibold text-gray-800">{page}</span> / {totalPages} (20 sản phẩm/trang)
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-8">
        {items.map((item) => (
          <ItemCard key={item.itemId} item={item} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-4 border-t border-gray-100">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1]
              const showEllipsis = prev && p - prev > 1

              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-2 text-gray-400 text-xs">...</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    disabled={loading}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                      p === page
                        ? 'bg-orange-600 text-white shadow-sm'
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
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
