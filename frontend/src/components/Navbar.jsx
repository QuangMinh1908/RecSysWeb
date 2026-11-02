import { ShoppingCart } from 'lucide-react'
import SearchBar from './SearchBar'

export default function Navbar({ keyword, onSearch, cartCount }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-ink text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:gap-6 sm:px-4">
        <a
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight"
          aria-label="RecShop – về trang chủ"
        >
          RecShop
        </a>

        <div className="min-w-0 flex-1">
          <SearchBar initialValue={keyword} onSearch={onSearch} />
        </div>

        <button
          type="button"
          aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
          className="relative grid size-11 shrink-0 place-items-center rounded-lg hover:bg-white/10"
        >
          <ShoppingCart className="size-6" />
          {cartCount > 0 && (
            <span className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-sale px-1 text-[11px] font-bold leading-5">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
