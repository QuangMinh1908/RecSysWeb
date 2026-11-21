import React, { useState } from 'react'
import ShopeeCard from './ShopeeCard'

const DB_PAGE_SIZE = 12

export default function ShopeeDailyDiscover({
  items = [],
  randomItems = [],
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  loading = false,
  likedItems = [],
  onLike,
  viewMode = 'shopee6',
}) {
  const [activeTab, setActiveTab] = useState('ai') // 'ai' or 'db'
  const [dbPage, setDbPage] = useState(1)

  const dbTotalItems = randomItems.length
  const dbTotalPages = Math.max(1, Math.ceil(dbTotalItems / DB_PAGE_SIZE))
  const currentDbItems = randomItems.slice((dbPage - 1) * DB_PAGE_SIZE, dbPage * DB_PAGE_SIZE)

  return (
    <section className="shopee-daily-section" id="daily-discover">
      {/* Sticky Tab Header: "GỢI Ý HÔM NAY" (Canonical Shopee Header) */}
      <div className="shopee-tab-header">
        <button
          type="button"
          className={`shopee-section-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <span>GỢI Ý HÔM NAY</span>
          <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.8 }}>
            (AI M4_GRU • {totalItems} SP)
          </span>
        </button>

        <button
          type="button"
          className={`shopee-section-tab ${activeTab === 'db' ? 'active' : ''}`}
          onClick={() => setActiveTab('db')}
        >
          <span>DỮ LIỆU GỐC DATABASE</span>
          <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.8 }}>
            (Gốc PostgreSQL • {dbTotalItems} SP)
          </span>
        </button>
      </div>

      {/* MODE 1: PURE SHOPEE 6-COLUMN GRID */}
      {viewMode === 'shopee6' ? (
        <div>
          {activeTab === 'ai' ? (
            /* AI Recommended Grid */
            <>
              {items && items.length > 0 ? (
                <div className="shopee-grid-6">
                  {items.map((item) => (
                    <ShopeeCard
                      key={`ai-${item.itemId}`}
                      item={item}
                      isBaseline={false}
                      onLike={onLike}
                      isLiked={likedItems.includes(item.itemId)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '13px' }}>
                  Không tìm thấy sản phẩm gợi ý phù hợp.
                </div>
              )}

              {/* AI Pagination */}
              {totalPages > 1 && (
                <div className="shopee-pagination-wrap">
                  <button
                    className="shopee-page-btn"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || loading}
                  >
                    ‹
                  </button>

                  {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
                    let p = i + 1
                    if (totalPages > 6 && page > 3) {
                      p = page - 3 + i
                      if (p > totalPages) p = totalPages - (5 - i)
                    }
                    return (
                      <button
                        key={`shopee-ai-p-${p}`}
                        onClick={() => onPageChange(p)}
                        disabled={loading}
                        className={`shopee-page-btn ${p === page ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    )
                  })}

                  <button
                    className="shopee-page-btn"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Database Baseline Grid */
            <>
              {currentDbItems && currentDbItems.length > 0 ? (
                <div className="shopee-grid-6">
                  {currentDbItems.map((item) => (
                    <ShopeeCard
                      key={`db-${item.itemId}`}
                      item={item}
                      isBaseline={true}
                      onLike={onLike}
                      isLiked={likedItems.includes(item.itemId)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '13px' }}>
                  Chưa có dữ liệu gốc đối chứng.
                </div>
              )}

              {/* Database Pagination */}
              {dbTotalPages > 1 && (
                <div className="shopee-pagination-wrap">
                  <button
                    className="shopee-page-btn"
                    onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                    disabled={dbPage <= 1}
                  >
                    ‹
                  </button>

                  {Array.from({ length: Math.min(6, dbTotalPages) }, (_, i) => {
                    let p = i + 1
                    if (dbTotalPages > 6 && dbPage > 3) {
                      p = dbPage - 3 + i
                      if (p > dbTotalPages) p = dbTotalPages - (5 - i)
                    }
                    return (
                      <button
                        key={`shopee-db-p-${p}`}
                        onClick={() => setDbPage(p)}
                        className={`shopee-page-btn ${p === dbPage ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    )
                  })}

                  <button
                    className="shopee-page-btn"
                    onClick={() => setDbPage((p) => Math.min(dbTotalPages, p + 1))}
                    disabled={dbPage >= dbTotalPages}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* MODE 2: DUAL SIDE-BY-SIDE COMPARISON */
        <div className="shopee-dual-layout">
          {/* Left: AI Model RecSys */}
          <div style={{ background: '#fff', padding: '14px', borderRadius: '3px', border: '1px solid #ebebeb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--shopee-orange)' }}>
                ĐỀ XUẤT AI (M4_GRU) – {totalItems} SP
              </span>
              <span style={{ fontSize: '11px', color: '#777' }}>Trang {page} / {totalPages}</span>
            </div>

            <div className="shopee-grid-ai">
              {items.map((item) => (
                <ShopeeCard
                  key={`dual-ai-${item.itemId}`}
                  item={item}
                  isBaseline={false}
                  onLike={onLike}
                  isLiked={likedItems.includes(item.itemId)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="shopee-pagination-wrap" style={{ marginTop: '20px' }}>
                <button
                  className="shopee-page-btn"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  ‹
                </button>
                <span style={{ fontSize: '12px', color: '#555' }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="shopee-page-btn"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Right: Database Baseline */}
          <div style={{ background: '#fff', padding: '14px', borderRadius: '3px', border: '1px solid #ebebeb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#333' }}>
                DỮ LIỆU GỐC DB – {dbTotalItems} SP
              </span>
              <span style={{ fontSize: '11px', color: '#777' }}>Trang {dbPage} / {dbTotalPages}</span>
            </div>

            <div className="shopee-grid-db">
              {currentDbItems.map((item) => (
                <ShopeeCard
                  key={`dual-db-${item.itemId}`}
                  item={item}
                  isBaseline={true}
                  onLike={onLike}
                  isLiked={likedItems.includes(item.itemId)}
                />
              ))}
            </div>

            {dbTotalPages > 1 && (
              <div className="shopee-pagination-wrap" style={{ marginTop: '20px' }}>
                <button
                  className="shopee-page-btn"
                  onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                  disabled={dbPage <= 1}
                >
                  ‹
                </button>
                <span style={{ fontSize: '12px', color: '#555' }}>
                  {dbPage} / {dbTotalPages}
                </span>
                <button
                  className="shopee-page-btn"
                  onClick={() => setDbPage((p) => Math.min(dbTotalPages, p + 1))}
                  disabled={dbPage >= dbTotalPages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
