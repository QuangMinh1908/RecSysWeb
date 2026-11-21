import React, { useState } from 'react'
import ProductCard from './ProductCard'

const BASELINE_PAGE_SIZE = 8

export default function ProductFeed({
  items = [],
  randomItems = [],
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  loading = false,
  likedItems = [],
  onLike,
}) {
  const [baselinePage, setBaselinePage] = useState(1)

  const baselineTotalItems = randomItems.length
  const baselineTotalPages = Math.max(1, Math.ceil(baselineTotalItems / BASELINE_PAGE_SIZE))
  const currentBaselineItems = randomItems.slice(
    (baselinePage - 1) * BASELINE_PAGE_SIZE,
    baselinePage * BASELINE_PAGE_SIZE
  )

  return (
    <section className="products-container" id="shop">
      <div className="comparison-grid-layout">
        {/* CỘT TRÁI: GỢI Ý HÀNG ĐẦU */}
        <div className="panel-card-ai">
          <div className="panel-top-info">
            <div>
              <strong style={{ fontSize: '16px', color: 'var(--ink)', letterSpacing: '-.02em' }}>
                Gợi ý hàng đầu
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: '700' }}>
                {totalItems} Sản phẩm
              </span>
              <span style={{ fontSize: '11px', opacity: 0.65, color: 'var(--ink)', marginLeft: '8px' }}>
                (Trang {page} / {totalPages})
              </span>
            </div>
          </div>

          {/* AI Grid */}
          {items && items.length > 0 ? (
            <div className="grid-ai-items">
              {items.map((item) => (
                <ProductCard
                  key={`ai-${item.itemId}`}
                  item={item}
                  isBaseline={false}
                  onLike={onLike}
                  isLiked={likedItems.includes(item.itemId)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5, fontSize: '13px' }}>
              Không tìm thấy sản phẩm đề xuất phù hợp.
            </div>
          )}

          {/* AI Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <span style={{ opacity: 0.75 }}>
                Trang <strong style={{ color: 'var(--orange)' }}>{page}</strong> / {totalPages} (20 SP/trang)
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="custom-page-btn"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  ← Trước
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1
                  if (totalPages > 5 && page > 3) {
                    p = page - 3 + i
                    if (p > totalPages) p = totalPages - (4 - i)
                  }
                  return (
                    <button
                      key={`ai-p-${p}`}
                      onClick={() => onPageChange(p)}
                      disabled={loading}
                      className={`custom-page-btn ${p === page ? 'active' : ''}`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  className="custom-page-btn"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM GỐC */}
        <div className="panel-card-db">
          <div className="panel-top-info">
            <div>
              <strong style={{ fontSize: '15px', color: 'var(--ink)', letterSpacing: '-.02em' }}>
                Danh sách sản phẩm gốc
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: '700' }}>
                {baselineTotalItems} SP
              </span>
              <span style={{ fontSize: '11px', opacity: 0.65, color: 'var(--ink)', marginLeft: '8px' }}>
                (Trang {baselinePage} / {baselineTotalPages})
              </span>
            </div>
          </div>

          {/* Database Grid */}
          {currentBaselineItems && currentBaselineItems.length > 0 ? (
            <div className="grid-db-items">
              {currentBaselineItems.map((item) => (
                <ProductCard
                  key={`db-${item.itemId}`}
                  item={item}
                  isBaseline={true}
                  onLike={onLike}
                  isLiked={likedItems.includes(item.itemId)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.4, fontSize: '12px' }}>
              Chưa có dữ liệu gốc đối chứng.
            </div>
          )}

          {/* Database Pagination */}
          {baselineTotalPages > 1 && (
            <div className="pagination-controls">
              <span style={{ fontSize: '11px', opacity: 0.7 }}>
                Trang {baselinePage} / {baselineTotalPages}
              </span>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="custom-page-btn"
                  onClick={() => setBaselinePage((p) => Math.max(1, p - 1))}
                  disabled={baselinePage <= 1}
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                >
                  ←
                </button>

                {Array.from({ length: Math.min(4, baselineTotalPages) }, (_, i) => {
                  let p = i + 1
                  if (baselineTotalPages > 4 && baselinePage > 2) {
                    p = baselinePage - 2 + i
                    if (p > baselineTotalPages) p = baselineTotalPages - (3 - i)
                  }
                  return (
                    <button
                      key={`db-p-${p}`}
                      onClick={() => setBaselinePage(p)}
                      className={`custom-page-btn ${p === baselinePage ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '10px' }}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  className="custom-page-btn"
                  onClick={() => setBaselinePage((p) => Math.min(baselineTotalPages, p + 1))}
                  disabled={baselinePage >= baselineTotalPages}
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
