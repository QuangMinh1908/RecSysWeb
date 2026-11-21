import React, { useState } from 'react'
import { Star, TrendingDown, Database } from 'lucide-react'
import { formatVND } from '../services/api'

const FALLBACK_IMAGES = {
  ao_thun_nam: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=80',
  ],
  chuot_khong_day: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=400&auto=format&fit=crop&q=80',
  ],
  sua: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80',
  ],
  tai_nghe_khong_day: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&auto=format&fit=crop&q=80',
  ],
}

function getFallbackPhoto(item) {
  const cat = item.category || 'ao_thun_nam'
  const list = FALLBACK_IMAGES[cat] || FALLBACK_IMAGES.ao_thun_nam
  const idx = Math.abs(Number(item.itemId) || 0) % list.length
  return list[idx]
}

export default function ItemCard({ item, isRandom = false, compact = false }) {
  const isHighVolatility = item.priceVolatilityTier === 'High'
  const isMediumVolatility = item.priceVolatilityTier === 'Medium'
  const pClickPercent = Math.round((item.pClick ?? 0) * 100)
  const isBaseline = isRandom || item.decision === 'BASELINE' || item.decision === 'RANDOM'
  const [imgSrc, setImgSrc] = useState(getFallbackPhoto(item))

  return (
    <div
      className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full hover:-translate-y-0.5 hover:shadow-md ${
        isBaseline
          ? 'border-gray-200/90 hover:border-slate-400'
          : 'border-blue-300/90 hover:border-blue-500 hover:shadow-blue-500/10'
      }`}
    >
      {/* Top Left Badge: Model Rank vs Baseline DB Badge */}
      <div className="absolute top-2 left-2 z-10">
        {isBaseline ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/85 backdrop-blur-xs text-slate-100 shadow-xs">
            <Database className="w-3 h-3 text-slate-300" /> DB #{item.rank ?? 1}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
            #{item.rank ?? 1}
          </span>
        )}
      </div>

      {/* Top Right Badges: CTR Score & Volatility (Only for Model items) */}
      {!isBaseline && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {item.pClick != null && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-500 text-white shadow-xs">
              CTR: {pClickPercent}%
            </span>
          )}
          {item.priceVolatilityTier && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-xs ${
                isHighVolatility ? 'bg-red-500' : isMediumVolatility ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            >
              {item.priceVolatilityTier} Vol
            </span>
          )}
        </div>
      )}

      {/* Image container */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgSrc(getFallbackPhoto(item))}
        />
        {item.discountRate > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
            <TrendingDown className="w-3 h-3" /> -{Math.round(item.discountRate)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[11px] text-gray-400 font-medium truncate mb-0.5">
            {item.shopName || 'Shop chính hãng'}
          </p>
          <h4
            className={`font-medium text-gray-800 line-clamp-2 leading-snug transition-colors ${
              compact ? 'text-xs' : 'text-sm'
            } ${isBaseline ? 'group-hover:text-slate-700' : 'group-hover:text-blue-600'}`}
          >
            {item.name}
          </h4>
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span
              className={`font-bold ${
                isBaseline ? 'text-slate-800' : 'text-orange-600'
              } ${compact ? 'text-sm' : 'text-base'}`}
            >
              {formatVND(item.currentPrice)}
            </span>
            {item.originalPrice > item.currentPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatVND(item.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-700">
                {(item.ratingAverage ?? 4.5).toFixed(1)}
              </span>
              <span className="text-gray-400">({item.reviewCount ?? 0})</span>
            </div>
            <span>Đã bán {Math.round(item.soldCount ?? 0).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
