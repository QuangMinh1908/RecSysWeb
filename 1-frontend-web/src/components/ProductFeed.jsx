import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

const BASELINE_PAGE_SIZE = 8

function Pagination({ page, totalPages, onChange, loading = false, label }) {
  if (totalPages <= 1) return null

  const count = Math.min(3, totalPages)
  const firstPage = Math.max(1, Math.min(page - 1, totalPages - count + 1))

  return (
    <nav className="pagination-controls" aria-label={label}>
      <span className="page-status">Trang {page} / {totalPages}</span>
      <div className="page-buttons">
        <button type="button" aria-label="Trang trước" onClick={() => onChange(page - 1)} disabled={page <= 1 || loading}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        {Array.from({ length: count }, (_, index) => {
          const number = firstPage + index
          return (
            <button type="button" key={number} aria-label={`Trang ${number}`}
              aria-current={number === page ? 'page' : undefined}
              disabled={loading || number === page} onClick={() => onChange(number)}>
              {number}
            </button>
          )
        })}
        <button type="button" aria-label="Trang sau" onClick={() => onChange(page + 1)} disabled={page >= totalPages || loading}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

export default function ProductFeed({
  items = [],
  randomItems = [],
  page = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  likedItems = [],
  onLike,
}) {
  const [baselinePage, setBaselinePage] = useState(1)
  const baselineTotalPages = Math.max(1, Math.ceil(randomItems.length / BASELINE_PAGE_SIZE))
  const baselineItems = randomItems.slice((baselinePage - 1) * BASELINE_PAGE_SIZE, baselinePage * BASELINE_PAGE_SIZE)

  return (
    <>
      <nav className="comparison-nav" aria-label="Nhóm kết quả">
        <a href="#recommendations">Đề xuất</a>
        <a href="#baseline">Danh sách gốc</a>
      </nav>
      <div className="comparison-grid-layout">
        <section className="results-panel" id="recommendations" aria-labelledby="recommendations-title">
          <h3 className="panel-heading" id="recommendations-title">Đề xuất</h3>
          <div className="grid-ai-items">
            {items.map((item) => (
              <ProductCard key={item.itemId} item={item} onLike={onLike} isLiked={likedItems.includes(item.itemId)} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} loading={loading} label="Trang đề xuất" />
        </section>
        <section className="results-panel" id="baseline" aria-labelledby="baseline-title">
          <h3 className="panel-heading" id="baseline-title">Danh sách gốc</h3>
          <div className="grid-db-items">
            {baselineItems.map((item) => (
              <ProductCard key={item.itemId} item={item} isBaseline onLike={onLike} isLiked={likedItems.includes(item.itemId)} />
            ))}
          </div>
          {!baselineItems.length && <p className="baseline-empty">Chưa có sản phẩm để đối chiếu.</p>}
          <Pagination page={baselinePage} totalPages={baselineTotalPages} onChange={setBaselinePage} label="Trang danh sách gốc" />
        </section>
      </div>
    </>
  )
}
