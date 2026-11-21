import { useEffect, useState } from 'react'
import { SearchX, ServerCrash } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { isCancel, searchProducts } from '../services/api'

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5'

function SkeletonGrid() {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="aspect-square animate-pulse bg-line/70" />
          <div className="space-y-2 p-3">
            <div className="h-3 animate-pulse rounded bg-line/70" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-line/70" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-line/70" />
          </div>
        </div>
      ))}
    </div>
  )
}

function Notice({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <Icon className="size-12 text-ink-soft/70" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-ink-soft">{children}</p>
      {action}
    </div>
  )
}

export default function Home({ keyword, onProductClick, onAddToCart }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    searchProducts(keyword, undefined, controller.signal)
      .then((data) => {
        setProducts(data)
        setStatus('success')
      })
      .catch((err) => {
        if (isCancel(err)) return // người dùng đã tìm từ khóa khác
        setStatus('error')
      })

    return () => controller.abort()
  }, [keyword, attempt])

  return (
    <main className="mx-auto max-w-6xl px-3 pb-16 pt-24 sm:px-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">
          {keyword ? `Kết quả cho “${keyword}”` : 'Sản phẩm nổi bật'}
        </h1>
        {status === 'success' && products.length > 0 && (
          <p className="text-sm text-ink-soft">{products.length} sản phẩm</p>
        )}
      </div>

      {status === 'loading' && <SkeletonGrid />}

      {status === 'error' && (
        <Notice
          icon={ServerCrash}
          title="Không kết nối được máy chủ"
          action={
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="h-10 rounded-lg bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
            >
              Thử lại
            </button>
          }
        >
          Kiểm tra Spring Boot đã chạy ở cổng 8080 và PostgreSQL đang bật, rồi thử lại.
        </Notice>
      )}

      {status === 'success' && products.length === 0 && (
        <Notice icon={SearchX} title="Không tìm thấy sản phẩm nào">
          Không có sản phẩm khớp với “{keyword}”. Hãy thử từ khóa ngắn hơn hoặc kiểm tra lại chính tả.
        </Notice>
      )}

      {status === 'success' && products.length > 0 && (
        <div className={GRID}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </main>
  )
}
