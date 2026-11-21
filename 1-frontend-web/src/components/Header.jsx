import React, { useState } from 'react'

export default function Header({ cartCount = 2, onSelectCategory }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="announcement">
        <span>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN TỪ 499K</span>
        <span className="announcement-secondary">ĐỔI TRẢ TRONG 30 NGÀY • CHÍNH HÃNG 100%</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="Về trang chủ">
          SÀN<span>•</span>STYLE
        </a>

        <nav className={menuOpen ? 'nav-open' : ''} aria-label="Điều hướng chính">
          <a href="#new" onClick={() => setMenuOpen(false)}>Hàng mới</a>
          <a
            href="#discovery"
            onClick={(e) => {
              e.preventDefault()
              onSelectCategory && onSelectCategory('ao_thun_nam')
              document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })
              setMenuOpen(false)
            }}
          >
            Áo thun
          </a>
          <a
            href="#discovery"
            onClick={(e) => {
              e.preventDefault()
              onSelectCategory && onSelectCategory('tai_nghe_khong_day')
              document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })
              setMenuOpen(false)
            }}
          >
            Tai nghe
          </a>
          <a
            href="#discovery"
            onClick={(e) => {
              e.preventDefault()
              onSelectCategory && onSelectCategory('chuot_khong_day')
              document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })
              setMenuOpen(false)
            }}
          >
            Chuột
          </a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Câu chuyện</a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Gợi ý AI</a>
        </nav>

        <div className="header-actions">
          <a
            href="#discovery"
            aria-label="Tìm kiếm"
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </a>

          <button aria-label="Tài khoản">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>

          <button aria-label="Giỏ hàng" className="bag-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 8h12l1 12H5L6 8Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <span>{cartCount}</span>
          </button>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mở menu"
          >
            <i /><i />
          </button>
        </div>
      </header>
    </>
  )
}
