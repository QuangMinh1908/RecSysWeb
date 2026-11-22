import React, { useState, useEffect } from 'react'
import { formatVND, getImageUrl } from '../services/api'

const FALLBACKS = {
  chuot_khong_day: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=700&q=85'
  ],
  laptop: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85'
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
  if (item && item.imageUrl) {
    const u = getImageUrl(item.imageUrl)
    if (u && !u.includes('placehold.co')) return u
  }
  const cat = item?.category || 'chuot_khong_day'
  const list = FALLBACKS[cat] || FALLBACKS.chuot_khong_day
  const idx = Math.abs(Number(item?.itemId) || 0) % list.length
  return list[idx]
}

export default function ProductCard({ item, isBaseline = false, onLike, isLiked = false }) {
  const [imgSrc, setImgSrc] = useState(() => resolvePhoto(item))

  useEffect(() => {
    setImgSrc(resolvePhoto(item))
  }, [item?.itemId, item?.imageUrl])

  const ctrValue = item.pClick ?? item.pclick
  const pClickPercent = ctrValue != null ? Math.round(Number(ctrValue) * 100) : null
  const isHighVol = item.priceVolatilityTier === 'High'
  const isMedVol = item.priceVolatilityTier === 'Medium'

  const rankTag = isBaseline ? `#${item.rank ?? 1}` : `#${item.rank ?? 1} Gợi ý`

  return (
    <article className="product-card">
      <div className={`product-image ${isBaseline ? 'compact' : ''}`}>
        <img
          src={imgSrc}
          alt={item.name}
          onError={() => {
            const cat = item.category || 'chuot_khong_day'
            const list = FALLBACKS[cat] || FALLBACKS.chuot_khong_day
            const idx = Math.abs(Number(item.itemId) || 0) % list.length
            setImgSrc(list[idx])
          }}
        />

        {/* Top-left Rank Tag */}
        <span className={`product-tag ${isBaseline ? 'product-tag-db' : ''}`}>
          {rankTag}
        </span>

        {/* Discount Badge */}
        {item.discountRate > 0 && (
          <span className="product-discount-tag">
            -{Math.round(item.discountRate)}%
          </span>
        )}

        {/* CTR & Volatility Badges */}
        {!isBaseline && (
          <>
            {pClickPercent != null && (
              <span className="badge-ctr-pill">
                CTR: {pClickPercent}%
              </span>
            )}
            {item.priceVolatilityTier && (
              <span
                className={`badge-vol-pill ${
                  isHighVol ? 'vol-high' : isMedVol ? 'vol-med' : 'vol-low'
                }`}
              >
                {item.priceVolatilityTier} Vol
              </span>
            )}
          </>
        )}

        {/* Heart Like Button */}
        <button
          className={isLiked ? 'liked' : ''}
          onClick={() => onLike && onLike(item.itemId)}
          aria-label={`Yêu thích ${item.name}`}
          type="button"
        >
          <svg
            width="13"
            height="13"
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

      <div className="product-info">
        {/* 1. TÊN SẢN PHẨM Ở TRÊN (CHỮ TO HƠN, HOVER CHUYỂN SANG VÀNG) */}
        <h3 className="product-title" title={item.name}>
          {item.name}
        </h3>

        {/* 2. TÊN SHOP Ở DƯỚI (CHỮ NHỎ HƠN) & ĐÁNH GIÁ SAO */}
        <div className="product-shop-row">
          <span className="product-shop-name" title={item.shopName || 'CHÍNH HÃNG'}>
            {item.shopName || 'CHÍNH HÃNG'}
          </span>
          <span className="product-rating">
            ★ {(item.ratingAverage ?? 4.5).toFixed(1)}
          </span>
        </div>

        {/* 3. GIÁ BÁN & SỐ LƯỢNG ĐÃ BÁN */}
        <div className="product-price-row">
          <strong className="product-current-price">{formatVND(item.currentPrice)}</strong>
          {item.originalPrice > item.currentPrice && (
            <del className="product-old-price">{formatVND(item.originalPrice)}</del>
          )}
          <span className="product-sold-count">
            Đã bán {Math.round(item.soldCount ?? 0).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>
    </article>
  )
}
