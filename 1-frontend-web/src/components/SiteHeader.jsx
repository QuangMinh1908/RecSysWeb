import { Heart, ShoppingBag } from 'lucide-react'

export default function SiteHeader({ likedCount = 0 }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="brand" href="#top">
          <span className="brand-mark"><ShoppingBag size={20} strokeWidth={1.8} aria-hidden="true" /></span>
          <span>SÀN<span className="brand-dot">.</span>STYLE</span>
        </a>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <a href="#filters">Khám phá</a>
          <a href="#shop">So sánh</a>
        </nav>
        <div className="liked-count" role="status" aria-label={`${likedCount} sản phẩm yêu thích`}>
          <Heart size={18} aria-hidden="true" />
          <span className="liked-label">Yêu thích</span>
          <span>{likedCount}</span>
        </div>
      </div>
    </header>
  )
}
