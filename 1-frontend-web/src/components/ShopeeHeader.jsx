import React from 'react'
import { KEYWORD_LABELS } from '../services/api'

export default function ShopeeHeader({
  keywords = [],
  selectedKeyword = '',
  onSelectKeyword,
  dates = [],
  selectedDate = 'latest',
  onSelectDate,
  onSearch,
  likedCount = 0,
}) {
  return (
    <header className="shopee-header-container">
      {/* Top micro bar */}
      <div className="shopee-top-bar">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span>Kênh Người Bán</span>
          <span>|</span>
          <span>Tải ứng dụng Shopee</span>
          <span>|</span>
          <span>Kết nối</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
            Mô hình M4_GRU Online
          </span>
          <span>Thông Báo</span>
          <span>Hỗ Trợ</span>
          <span style={{ fontWeight: '600' }}>Admin Shopee</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="shopee-main-header">
        {/* Logo Shopee */}
        <a href="#" className="shopee-logo-link" aria-label="Shopee Home">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
            <path
              d="M33.3 12.5H28.7C28.2 6.6 24.3 2.5 20 2.5C15.7 2.5 11.8 6.6 11.3 12.5H6.7C5.5 12.5 4.5 13.5 4.5 14.7L6.8 35.2C6.9 36.5 8 37.5 9.3 37.5H30.7C32 37.5 33.1 36.5 33.2 35.2L35.5 14.7C35.5 13.5 34.5 12.5 33.3 12.5ZM20 5C22.8 5 25.5 8.1 26.1 12.5H13.9C14.5 8.1 17.2 5 20 5ZM25.8 24.2C25.8 26.8 23.3 28.5 20.3 28.5C17.5 28.5 15.2 27.2 14.5 25.6C14.3 25.2 14.5 24.8 14.9 24.6L16.4 23.7C16.8 23.5 17.2 23.6 17.4 24C17.8 24.8 19 25.6 20.3 25.6C21.6 25.6 22.7 24.8 22.7 23.8C22.7 22.8 21.9 22.3 20 21.6C17.2 20.6 14.8 19.5 14.8 16.9C14.8 14.5 17.1 12.8 19.9 12.8C22.3 12.8 24.2 13.8 25 15.1C25.2 15.5 25.1 16 24.7 16.2L23.3 17.1C22.9 17.3 22.5 17.2 22.3 16.8C21.8 16.1 20.9 15.6 19.9 15.6C18.8 15.6 17.9 16.3 17.9 17.1C17.9 18 18.7 18.4 20.6 19.1C23.6 20.2 25.8 21.3 25.8 24.2Z"
              fill="#ffffff"
            />
          </svg>
          <span>Shopee</span>
        </a>

        {/* Center Search Area */}
        <div className="shopee-search-wrap">
          <div className="shopee-search-bar">
            {/* Category Dropdown */}
            <select
              className="shopee-category-select"
              value={selectedKeyword}
              onChange={(e) => onSelectKeyword(e.target.value)}
              title="Chọn ngành hàng tìm kiếm"
            >
              {keywords.map((kw) => (
                <option key={kw} value={kw}>
                  {KEYWORD_LABELS[kw] || kw}
                </option>
              ))}
            </select>

            {/* Snapshot Date Dropdown */}
            <select
              className="shopee-date-select"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              title="Chọn ngày dữ liệu"
            >
              <option value="latest">Mới nhất (Latest)</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Search Input placeholder */}
            <input
              type="text"
              className="shopee-search-input"
              placeholder="Shopee bao ship 0Đ - Đăng ký ngay! Đề xuất sản phẩm thông minh..."
              readOnly
            />

            {/* Search Button */}
            <button
              className="shopee-search-btn"
              onClick={onSearch}
              aria-label="Tìm kiếm"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </div>

          {/* Hot Keywords Under Search Bar */}
          <div className="shopee-hot-keywords">
            {keywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => onSelectKeyword(kw)}
                style={{ fontWeight: selectedKeyword === kw ? '700' : 'normal' }}
              >
                {KEYWORD_LABELS[kw] || kw}
              </button>
            ))}
            <button type="button">Săn Điện Thoại iPhone 0 Đồng</button>
            <button type="button">Áo Tay Dài</button>
            <button type="button">Balo Đẹp</button>
          </div>
        </div>

        {/* Right Shopping Cart */}
        <div className="shopee-cart-wrap">
          <button className="shopee-cart-btn" aria-label="Giỏ hàng">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-13z" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 2h3l1 4" />
            </svg>
            {likedCount > 0 && <span className="shopee-cart-badge">{likedCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
