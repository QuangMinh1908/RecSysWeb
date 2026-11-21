import React from 'react'
import { KEYWORD_LABELS } from '../services/api'

const PERSONAS = [
  { id: 0, title: 'Săn deal', subtitle: 'Giá tốt mỗi ngày' },
  { id: 1, title: 'Bắt trend', subtitle: 'Mẫu mới thịnh hành' },
  { id: 2, title: 'Chất lượng', subtitle: 'Chọn lọc kỹ lưỡng' },
  { id: 3, title: 'Tiết kiệm', subtitle: 'Tối ưu ngân sách' },
  { id: 4, title: 'Thương hiệu', subtitle: 'Gian hàng chính hãng' },
]

export default function TopControlFrame({
  keywords = [],
  selectedKeyword = '',
  onSelectKeyword,
  dates = [],
  selectedDate = 'latest',
  onSelectDate,
  persona = 0,
  onSelectPersona,
  onSearch,
  loading = false,
}) {
  return (
    <section className="top-discovery-frame" aria-label="Khung điều khiển gợi ý">
      {/* Row 1: Header + Dropdowns + Search CTA */}
      <div className="discovery-header-row">
        <div className="discovery-title-group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Z" />
            <path d="m5 15 .8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />
          </svg>
          <div>
            <span>GỢI Ý THÔNG MINH</span>
            <strong>Chọn gu & ngành hàng</strong>
          </div>
        </div>

        <div className="discovery-filters">
          {/* Ngành hàng */}
          <div className="discovery-select-item">
            <span className="discovery-select-label">Ngành hàng</span>
            <select
              className="discovery-select"
              value={selectedKeyword}
              onChange={(e) => onSelectKeyword(e.target.value)}
            >
              {keywords.map((kw) => (
                <option key={kw} value={kw}>
                  {KEYWORD_LABELS[kw] || kw}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày dữ liệu (Snapshot) */}
          <div className="discovery-select-item">
            <span className="discovery-select-label">Snapshot</span>
            <select
              className="discovery-select"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
            >
              <option value="latest">Mới nhất (Latest)</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            className="ai-search-btn"
            onClick={onSearch}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <span>Đang chấm điểm AI...</span>
            ) : (
              <>
                <span>Tìm sản phẩm cho tôi</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: 5 Persona Tabs */}
      <div className="persona-grid">
        {PERSONAS.map(({ id, title, subtitle }) => (
          <button
            key={id}
            type="button"
            className={persona === id ? 'active' : ''}
            onClick={() => onSelectPersona(id)}
          >
            <span>0{id + 1}</span>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
