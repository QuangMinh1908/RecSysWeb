import { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { trackInteraction } from './services/api'

export default function App() {
  const [keyword, setKeyword] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  // Tracking chạy ngầm: lỗi mạng không được làm hỏng trải nghiệm của người dùng.
  const handleProductClick = useCallback((product) => {
    trackInteraction(product.id, 'CLICK').catch((err) =>
      console.warn('Không ghi được CLICK:', err.message),
    )
  }, [])

  const handleAddToCart = useCallback(
    (product) => {
      setCartCount((n) => n + 1)
      showToast(`Đã thêm vào giỏ: ${product.name}`)
      trackInteraction(product.id, 'CART').catch((err) =>
        console.warn('Không ghi được CART:', err.message),
      )
    },
    [showToast],
  )

  return (
    <>
      <Navbar keyword={keyword} onSearch={setKeyword} cartCount={cartCount} />
      <Home
        keyword={keyword}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
      />

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4"
      >
        {toast && (
          <p className="max-w-sm truncate rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </p>
        )}
      </div>
    </>
  )
}
