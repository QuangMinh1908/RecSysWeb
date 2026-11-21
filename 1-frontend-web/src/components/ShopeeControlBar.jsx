import React from 'react'

const PERSONAS = [
  { id: 0, title: 'Săn deal (Deal Hunter)' },
  { id: 1, title: 'Bắt trend (Trend Chaser)' },
  { id: 2, title: 'Chất lượng (Quality)' },
  { id: 3, title: 'Tiết kiệm (Frugal)' },
  { id: 4, title: 'Thương hiệu (Mall)' },
]

export default function ShopeeControlBar({
  persona = 0,
  onSelectPersona,
  viewMode = 'shopee6',
  onChangeViewMode,
  loading = false,
}) {
  return (
    <div className="shopee-control-toolbar">
      <div className="shopee-filter-card">
        {/* Left: Persona Tabs */}
        <div className="shopee-persona-list">
          <span className="shopee-persona-label">Gu mua sắm:</span>
          {PERSONAS.map(({ id, title }) => (
            <button
              key={id}
              type="button"
              className={`shopee-persona-btn ${persona === id ? 'active' : ''}`}
              onClick={() => onSelectPersona(id)}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Right: View mode switch */}
        <div className="shopee-view-toggles">
          <span style={{ fontSize: '11px', color: '#666', marginRight: '4px' }}>Bố cục:</span>
          <button
            type="button"
            className={`shopee-toggle-btn ${viewMode === 'shopee6' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('shopee6')}
            title="Hiển thị lưới 6 cột chuẩn Shopee"
          >
            Lưới Shopee 6 Cột
          </button>
          <button
            type="button"
            className={`shopee-toggle-btn ${viewMode === 'dual' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('dual')}
            title="Hiển thị so sánh song song AI và Database"
          >
            So Sánh Đối Chứng (AI & DB)
          </button>
        </div>
      </div>
    </div>
  )
}
