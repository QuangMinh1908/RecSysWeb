import React, { useState } from 'react'
import EcommerceCard from './EcommerceCard'

const BASELINE_PAGE_SIZE = 8

export default function ComparisonGrid({
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
    <section className="products" id="shop">
      {/* Section Heading */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">CHỌN RIÊNG CHO BẠN</p>
          <h2>THE EDIT.</h2>
          <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: 0.7 }}>
            So sánh trực quan: Đề xuất Temporal AI (M4_GRU) vs Dữ liệu gốc Database
          </p>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span className="badge-ai">AI RANKER</span>
          <span className="badge-db">DB BASELINE</span>
        </div>
      </div>

      {/* Main Dual Grid Comparison */}
      <div className="comparison-wrapper">
        {/* LEFT COLUMN: AI Recommendations (M4_GRU) */}
        <div className="panel-ai">
          <div className="panel-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-ai">AI M4_GRU</span>
                <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>
                  Gợi ý Cá nhân hóa & Bắt trend
                </strong>
              </div>
              <span style={{ fontSize: '11px', opacity: 0.65 }}>
                Đã xếp hạng CTR tối ưu theo chuỗi thời gian & hành vi
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--orange)' }}>
                {totalItems} Sản phẩm
              </strong>
              <span style={{ fontSize: '10px', opacity: 0.6 }}>
                Trang {page} / {totalPages}
              </span>
            </div>
          </div>

          {/* Product Grid AI */}
          {items && items.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {items.map((item) => (
                <EcommerceCard
                  key={`ai-${item.itemId}`}
                  item={item}
                  isBaseline={false}
                  onLike={onLike}
                  isLiked={likedItems.includes(item.itemId)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5, fontSize: '13px' }}>
              Không tìm thấy sản phẩm đề xuất phù hợp.
            </div>
          )}

          {/* Pagination AI */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <span style={{ opacity: 0.75 }}>
                Hiển thị trang <strong style={{ color: 'var(--orange)' }}>{page}</strong> / {totalPages} (20 SP/trang)
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="page-btn"
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
                      key={`ai-page-${p}`}
                      onClick={() => onPageChange(p)}
                      disabled={loading}
                      className={`page-btn ${p === page ? 'active' : ''}`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  className="page-btn"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Database Baseline (Toàn bộ sản phẩm gốc) */}
        <div className="panel-db">
          <div className="panel-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-db">DATABASE GỐC</span>
                <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>
                  Đối chứng lưu trữ DB
                </strong>
              </div>
              <span style={{ fontSize: '11px', opacity: 0.65 }}>
                Thứ tự tuần tự nguyên bản trong PostgreSQL (chưa qua AI)
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>
                {baselineTotalItems} SP
              </strong>
              <span style={{ fontSize: '10px', opacity: 0.6 }}>
                8 SP / trang
              </span>
            </div>
          </div>

          {/* Baseline Grid */}
          {currentBaselineItems && currentBaselineItems.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              {currentBaselineItems.map((item) => (
                <EcommerceCard
                  key={`db-${item.itemId}`}
                  item={item}
                  isBaseline={true}
                  onLike={onLike}
                  isLiked={likedItems.includes(item.itemId)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', opacity: 0.4, fontSize: '12px' }}>
              Chưa có dữ liệu gốc đối chứng.
            </div>
          )}

          {/* Pagination Baseline */}
          {baselineTotalPages > 1 && (
            <div className="pagination-bar">
              <span style={{ fontSize: '11px', opacity: 0.7 }}>
                Trang <strong style={{ color: 'var(--ink)' }}>{baselinePage}</strong> / {baselineTotalPages}
              </span>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="page-btn"
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
                      key={`db-page-${p}`}
                      onClick={() => setBaselinePage(p)}
                      className={`page-btn ${p === baselinePage ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '10px' }}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  className="page-btn"
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
