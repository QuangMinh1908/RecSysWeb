import React from 'react'

export default function SiteHeader({ likedCount = 0 }) {
  return (
    <>
      <div className="announcement">
        <span>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN TỪ 499K</span>
        <span style={{ opacity: 0.85 }}>ĐỔI TRẢ TRONG 30 NGÀY • CHÍNH HÃNG 100%</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="Về trang chủ">
          SÀN<span>•</span>STYLE
        </a>

        <div className="header-actions">
          <button className="bag-button" aria-label="Sản phẩm đã thích">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 8h12l1 12H5L6 8Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <span>{likedCount}</span>
          </button>
        </div>
      </header>
    </>
  )
}
