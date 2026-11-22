import React, { useState } from 'react'
import { formatVND, getImageUrl } from '../services/api'

const FALLBACKS = {
  ao_thun_nam: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=600&q=80'
  ],
  chuot_khong_day: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=600&q=80'
  ],
  sua: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80'
  ],
  tai_nghe_khong_day: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
  ]
}

const LOCATIONS = [
  'Thành phố Hà Nội',
  'Thành phố Hồ Chí Minh',
  'Tỉnh Bắc Ninh',
  'Tỉnh Lạng Sơn',
  'Tỉnh Đồng Nai',
  'Tỉnh Bình Dương',
]

function resolvePhoto(item) {
  if (item.imageUrl) {
    const u = getImageUrl(item.imageUrl)
    if (u && !u.includes('placehold.co')) return u
  }
  const cat = item.category || 'ao_thun_nam'
  const list = FALLBACKS[cat] || FALLBACKS.ao_thun_nam
  const idx = Math.abs(Number(item.itemId) || 0) % list.length
  return list[idx]
}

export default function ShopeeCard({ item, isBaseline = false, onLike, isLiked = false }) {
  const [imgSrc, setImgSrc] = useState(() => resolvePhoto(item))
  const ctrValue = item.pClick ?? item.pclick
  const pClickPercent = ctrValue != null ? Math.round(Number(ctrValue) * 100) : null
  const isHighVol = item.priceVolatilityTier === 'High'
  const isMedVol = item.priceVolatilityTier === 'Medium'

  const location = LOCATIONS[Math.abs(Number(item.itemId) || 0) % LOCATIONS.length]
  const isMall = item.shopName?.toLowerCase().includes('mall') || item.brandId > 30
  const isFavoritePlus = !isMall && (Number(item.itemId) % 2 === 0)

  return (
    <article className="shopee-card" onClick={() => onLike && onLike(item.itemId)}>
      {/* 1:1 Aspect Ratio Image */}
      <div className="shopee-card-img-wrap">
        <img loading="lazy" decoding="async"
          src={imgSrc}
          alt={item.name}
          className="shopee-card-img"
          onError={() => {
            const cat = item.category || 'ao_thun_nam'
            const list = FALLBACKS[cat] || FALLBACKS.ao_thun_nam
            setImgSrc(list[0])
          }}
        />

        {/* Top-Right Yellow Discount Ribbon (Shopee Style) */}
        {item.discountRate > 0 && (
          <div className="shopee-discount-tag">
            <span className="shopee-discount-percent">-{Math.round(item.discountRate)}%</span>
            <span className="shopee-discount-label">GIẢM</span>
          </div>
        )}

        {/* Top-Left AI Rank or DB Rank Badge */}
        <div className="shopee-ai-badge">
          {isBaseline ? `DB #${item.rank ?? 1}` : `#${item.rank ?? 1} AI PICK`}
        </div>

        {/* Bottom badges on image (Voucher Xtra, Siêu Rẻ) */}
        <div className="shopee-img-footer-badge">
          <span className="badge-voucher-xtra">VOUCHER XTRA</span>
          <span className="badge-sieu-re">SIÊU RẺ</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="shopee-card-body">
        {/* Title row with [Yêu thích] / [Mall] badge */}
        <div className="shopee-title-row">
          <p className="shopee-card-title">
            {isMall ? (
              <span className="badge-mall">Mall</span>
            ) : isFavoritePlus ? (
              <span className="badge-yeuthich">Yêu thích+</span>
            ) : (
              <span className="badge-yeuthich">Yêu thích</span>
            )}
            {item.name}
          </p>
        </div>

        {/* Voucher tags row */}
        <div className="shopee-tag-row">
          <span className="shopee-voucher-tag">Rẻ Vô Địch</span>
          {pClickPercent != null && (
            <span className="shopee-voucher-tag" style={{ borderColor: '#d0011b', color: '#d0011b' }}>
              CTR: {pClickPercent}%
            </span>
          )}
          {item.priceVolatilityTier && (
            <span
              className={`shopee-vol-tag ${
                isHighVol ? 'shopee-vol-high' : isMedVol ? 'shopee-vol-med' : 'shopee-vol-low'
              }`}
            >
              {item.priceVolatilityTier} Vol
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="shopee-price-row">
          <div className="shopee-price-main">
            <span className="shopee-currency">₫</span>
            <span>{Math.round(item.currentPrice).toLocaleString('vi-VN')}</span>
            {item.originalPrice > item.currentPrice && (
              <span className="shopee-price-old">
                ₫{Math.round(item.originalPrice).toLocaleString('vi-VN')}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Sold count & location */}
        <div className="shopee-card-footer">
          <span>Đã bán {Math.round(item.soldCount ?? 0).toLocaleString('vi-VN')}</span>
          <span title={location}>{location}</span>
        </div>
      </div>
    </article>
  )
}
