import { useState } from 'react'
import { Heart, ImageOff, Star } from 'lucide-react'
import { formatVND, getImageUrl } from '../services/api'

export default function ProductCard({ item, isBaseline = false, onLike, isLiked = false }) {
  const [failedImage, setFailedImage] = useState(null)
  const source = item.imageUrl ? getImageUrl(item.imageUrl) : null
  const { currentPrice, originalPrice, discountRate } = item
  const hasComparablePrices = Number.isFinite(originalPrice) && originalPrice > 0
    && Number.isFinite(currentPrice) && currentPrice >= 0
  const hasPriceDrop = hasComparablePrices && currentPrice < originalPrice
  const discount = hasComparablePrices
    ? ((originalPrice - currentPrice) / originalPrice) * 100
    : discountRate
  const discountLabel = discount > 0 ? (discount < 1 ? '<1%' : `${Math.round(discount)}%`) : null

  return (
    <article className="product-card">
      <div className="product-image">
        {source && source !== failedImage ? (
          <img src={source} alt={item.name} loading="lazy" decoding="async" onError={() => setFailedImage(source)} />
        ) : (
          <div className="image-unavailable"><ImageOff size={24} aria-hidden="true" /><span>Chưa có ảnh</span></div>
        )}
        {discountLabel && <span className="product-discount">Giảm {discountLabel}</span>}
        {!isBaseline && item.rank != null && <span className="product-rank" aria-label={`Hạng ${item.rank}`}>#{item.rank}</span>}
        {onLike && (
          <button className="like-button" onClick={() => onLike(item.itemId)} aria-label={`Yêu thích ${item.name}`}
            aria-pressed={isLiked} type="button">
            <Heart size={19} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="product-info">
        <h4 className="product-title" title={item.name}>{item.name}</h4>
        {item.shopName && <p className="product-shop-name" title={item.shopName}>{item.shopName}</p>}
        <div className="product-price-row">
          <strong>{currentPrice == null ? 'Chưa có giá' : formatVND(currentPrice)}</strong>
          {hasPriceDrop && <del>{formatVND(originalPrice)}</del>}
        </div>
        <div className="product-details">
          {item.ratingAverage != null && <span><Star size={14} aria-hidden="true" /> {Number(item.ratingAverage).toFixed(1)}</span>}
          {item.soldCount != null && <span>Đã bán {Math.round(item.soldCount).toLocaleString('vi-VN')}</span>}
        </div>
      </div>
    </article>
  )
}
