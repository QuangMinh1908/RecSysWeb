import React, { useState } from 'react'
import { formatVND, getImageUrl } from '../services/api'

const FALLBACKS = {
  ao_thun_nam: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=700&q=85'
  ],
  chuot_khong_day: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=700&q=85'
  ],
  sua: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=700&q=85'
  ],
  tai_nghe_khong_day: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85'
  ]
}

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

export default function ItemCard({ item, isBaseline = false, onLike, isLiked = false }) {
  const [imgSrc, setImgSrc] = useState(() => resolvePhoto(item))
  const ctrValue = item.pClick ?? item.pclick
  const pClickPercent = ctrValue != null ? Math.round(Number(ctrValue) * 100) : null
  const isHighVol = item.priceVolatilityTier === 'High'
  const isMedVol = item.priceVolatilityTier === 'Medium'

  const rankTag = isBaseline ? `DB #${item.rank ?? 1}` : `#${item.rank ?? 1} AI`
  const discountText = item.discountRate > 0 ? `-${Math.round(item.discountRate)}%` : null

  return (
    <article className="item-card">
      <div className={`item-media ${isBaseline ? 'compact' : ''}`}>
        <img
          src={imgSrc}
          alt={item.name}
          onError={() => {
            const cat = item.category || 'ao_thun_nam'
            const list = FALLBACKS[cat] || FALLBACKS.ao_thun_nam
            setImgSrc(list[0])
          }}
        />

        {/* Rank tag */}
        <span className={`rank-pill ${isBaseline ? 'rank-pill-db' : 'rank-pill-ai'}`}>
          {rankTag}
        </span>

        {/* Discount tag */}
        {discountText && (
          <span className="discount-pill">
            {discountText}
          </span>
        )}

        {/* AI metrics badges */}
        {!isBaseline && (
          <>
            {pClickPercent != null && (
              <span className="ctr-pill">
                CTR: {pClickPercent}%
              </span>
            )}
            {item.priceVolatilityTier && (
              <span
                className={`vol-pill ${
                  isHighVol ? 'vol-high' : isMedVol ? 'vol-med' : 'vol-low'
                }`}
              >
                {item.priceVolatilityTier} Vol
              </span>
            )}
          </>
        )}

        {/* Like heart button */}
        <button
          className={`item-like-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike && onLike(item.itemId)}
          aria-label={`Yêu thích ${item.name}`}
          type="button"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
        </button>
      </div>

      <div className="item-body">
        <div>
          <div className="item-meta-top">
            <span className="item-shop">{item.shopName || 'CHÍNH HÃNG'}</span>
            <span>★ {(item.ratingAverage ?? 4.5).toFixed(1)}</span>
          </div>

          <h3 className="item-title" title={item.name}>
            {item.name}
          </h3>
        </div>

        <div>
          <div className="item-pricing">
            <span className="price-current">{formatVND(item.currentPrice)}</span>
            {item.originalPrice > item.currentPrice && (
              <span className="price-old">{formatVND(item.originalPrice)}</span>
            )}
          </div>

          <div className="item-meta-bottom">
            <span>Đã bán {Math.round(item.soldCount ?? 0).toLocaleString('vi-VN')}</span>
            <span>ID: {item.itemId}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
