import React from 'react'
import { KEYWORD_LABELS } from '../services/api'

const PERSONAS_CONFIG = [
  { id: 0, title: 'Săn deal', subtitle: 'Giá tốt mỗi ngày' },
  { id: 1, title: 'Bắt trend', subtitle: 'Mẫu mới thịnh hành' },
  { id: 2, title: 'Chất lượng', subtitle: 'Chọn lọc kỹ lưỡng' },
  { id: 3, title: 'Tiết kiệm', subtitle: 'Tối ưu ngân sách' },
  { id: 4, title: 'Thương hiệu', subtitle: 'Gian hàng chính hãng' },
]

export default function DiscoveryBar({
  keywords = [],
  selectedKeyword = '',
  onSelectKeyword,
  dates = [],
  selectedDate = 'latest',
  onSelectDate,
  persona = 0,
  onSelectPersona,
  onTriggerSearch,
  loading = false,
}) {
  return (
    <section className="discovery" id="discovery" aria-label="Tìm kiếm thông minh">
      {/* Title + Filter selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
        <div className="discovery-title">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Z" />
            <path d="m5 15 .8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />
          </svg>
          <div>
            <span>GỢI Ý THÔNG MINH</span>
            <strong>Chọn gu & ngành hàng</strong>
          </div>
        </div>

        {/* Category & Date Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
          <div className="discovery-select-group">
            <label className="discovery-select-label">Ngành hàng</label>
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

          <div className="discovery-select-group">
            <label className="discovery-select-label">Snapshot</label>
            <select
              className="discovery-select"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
            >
              <option value="latest">Mới nhất</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 Persona Tabs */}
      <div
        className="persona-list"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
        }}
      >
        {PERSONAS_CONFIG.map(({ id, title, subtitle }) => (
          <button
            key={id}
            onClick={() => onSelectPersona(id)}
            className={persona === id ? 'active' : ''}
          >
            <span>0{id + 1}</span>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </button>
        ))}
      </div>

      {/* Search CTA Button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          className="ai-button"
          onClick={onTriggerSearch}
          disabled={loading}
          style={{ width: '100%', height: '100%', minHeight: '60px' }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="pulse-spinner" />
              <span>ĐANG CHẤM ĐIỂM...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', justifyContent: 'space-between' }}>
              <span>TÌM CHO TÔI</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </section>
  )
}
