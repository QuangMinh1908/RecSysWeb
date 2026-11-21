import React from 'react'

export default function TopBar({ likedCount = 0 }) {
  return (
    <>
      <div className="announcement-bar">
        <span>MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN TỪ 499K</span>
        <span>CHÍNH HÃNG 100% • ĐỔI TRẢ TRONG 30 NGÀY</span>
      </div>

      <header className="compact-header">
        <a className="brand-logo" href="#" aria-label="Trang chủ">
          SÀN<span>•</span>STYLE
        </a>

        <div className="header-status">
          <span className="status-dot" />
          <span>Model M4_GRU Active</span>
        </div>

        <div className="cart-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
          <span>{likedCount}</span> Đã lưu
        </div>
      </header>
    </>
  )
}
