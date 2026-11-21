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

export default function EcommerceCard({ item, isBaseline = false, onLike, isLiked = false }) {
  const [imgSrc, setImgSrc] = useState(() => resolvePhoto(item))
  const ctrValue = item.pClick ?? item.pclick
  const pClickPercent = ctrValue != null ? Math.round(Number(ctrValue) * 100) : null
  const isHighVol = item.priceVolatilityTier === 'High'
  const isMedVol = item.priceVolatilityTier === 'Medium'

  const rankTag = isBaseline ? `DB #${item.rank ?? 1}` : `#${item.rank ?? 1} AI PICK`
  const discountText = item.discountRate > 0 ? `-${Math.round(item.discountRate)}%` : null

  return (
    <article className="product-card">
      <div className="product-image" style={{ height: isBaseline ? '280px' : '380px' }}>
        <img
          src={imgSrc}
          alt={item.name}
          onError={() => {
            const cat = item.category || 'ao_thun_nam'
            const list = FALLBACKS[cat] || FALLBACKS.ao_thun_nam
            setImgSrc(list[0])
          }}
        />

        {/* Top-left tag (Rank) */}
        <span
          className="product-tag"
          style={{
            background: isBaseline ? 'rgba(247, 237, 219, 0.2)' : 'var(--orange)',
            color: isBaseline ? 'var(--ink)' : 'var(--dark)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {rankTag}
        </span>

        {/* Discount badge if present */}
        {discountText && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              bottom: '14px',
              padding: '4px 8px',
              background: '#dc2626',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '800',
              borderRadius: '3px',
              letterSpacing: '.05em',
            }}
          >
            {discountText}
          </span>
        )}

        {/* CTR & Volatility badges for AI model */}
        {!isBaseline && (
          <>
            {pClickPercent != null && (
              <span className="badge-ctr">
                CTR: {pClickPercent}%
              </span>
            )}
            {item.priceVolatilityTier && (
              <span
                className={`badge-vol ${
                  isHighVol ? 'badge-vol-high' : isMedVol ? 'badge-vol-medium' : 'badge-vol-low'
                }`}
              >
                {item.priceVolatilityTier} Vol
              </span>
            )}
          </>
        )}

        {/* Like heart button */}
        <button
          className={isLiked ? 'liked' : ''}
          onClick={() => onLike && onLike(item.itemId)}
          aria-label={`Yêu thích ${item.name}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
        </button>
      </div>

      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{item.shopName || 'CHÍNH HÃNG'}</span>
          <span style={{ fontSize: '10px', color: 'rgba(247, 237, 219, 0.45)' }}>
            ★ {(item.ratingAverage ?? 4.5).toFixed(1)} ({item.reviewCount ?? 0})
          </span>
        </div>

        <h3
          title={item.name}
          style={{
            fontSize: isBaseline ? '13px' : '15px',
            lineHeight: 1.35,
            height: '2.7em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            margin: '8px 0',
          }}
        >
          {item.name}
        </h3>

        <div>
          <strong style={{ color: isBaseline ? 'var(--ink)' : 'var(--orange)' }}>
            {formatVND(item.currentPrice)}
          </strong>
          {item.originalPrice > item.currentPrice && (
            <del>{formatVND(item.originalPrice)}</del>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6 }}>
            Đã bán {Math.round(item.soldCount ?? 0).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>
    </article>
  )
}
