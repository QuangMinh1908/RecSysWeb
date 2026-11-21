import React from 'react'
import { Star, ShoppingBag, TrendingDown, Award } from 'lucide-react'
import { formatVND, getImageUrl } from '../services/api'

export default function ItemCard({ item }) {
  const isHighVolatility = item.priceVolatilityTier === 'High'
  const isMediumVolatility = item.priceVolatilityTier === 'Medium'
  const pClickPercent = Math.round((item.pClick ?? 0) * 100)

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Rank badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900/80 backdrop-blur-sm text-white shadow-sm">
          #{item.rank ?? 1}
        </span>
      </div>

      {/* Volatility & CTR score badges */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
        {item.pClick != null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-500 text-white shadow-sm">
            CTR: {pClickPercent}%
          </span>
        )}
        {item.priceVolatilityTier && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-white shadow-sm ${
              isHighVolatility ? 'bg-red-500' : isMediumVolatility ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          >
            {item.priceVolatilityTier} Vol
          </span>
        )}
      </div>

      {/* Image container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center">
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = 'https://placehold.co/300x300?text=Shopee'
          }}
        />
        {item.discountRate > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" /> -{Math.round(item.discountRate)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium truncate mb-1">
            {item.shopName || 'Shop chính hãng'}
          </p>
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
            {item.name}
          </h4>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-base font-bold text-orange-600">
              {formatVND(item.currentPrice)}
            </span>
            {item.originalPrice > item.currentPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(item.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
