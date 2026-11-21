import { useState } from 'react'
import { ImageOff, ShoppingCart } from 'lucide-react'

const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round((1 - price / originalPrice) * 100)
}

export default function ProductCard({ product, onClick, onAddToCart }) {
  const [imageFailed, setImageFailed] = useState(false)
  const discount = discountPercent(product.price, product.originalPrice)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-lg">
      {/* Vùng bấm chính: ghi nhận hành vi CLICK */}
      <button
        type="button"
        onClick={() => onClick(product)}
        className="flex flex-1 flex-col text-left"
      >
        <div className="relative aspect-square w-full bg-paper">
          {imageFailed || !product.imageUrl ? (
            <div className="grid size-full place-items-center text-ink-soft/60">
              <ImageOff className="size-10" aria-label="Không tải được ảnh" />
            </div>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="size-full object-cover"
            />
          )}
          {discount > 0 && (
            <span className="absolute right-0 top-2 rounded-l-md bg-sale px-2 py-0.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-medium">{product.name}</h3>
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
            <span className="text-base font-bold text-sale">{vnd.format(product.price)}</span>
            {discount > 0 && (
              <span className="text-xs text-ink-soft line-through">
                {vnd.format(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-leaf text-sm font-semibold text-leaf transition-colors hover:bg-leaf hover:text-white"
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  )
}
