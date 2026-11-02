import axios, { isCancel } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  timeout: 10000,
})

// Chưa có màn hình đăng nhập: dùng user demo (id = 1) đã được seed trong database.
export const DEMO_USER_ID = 1

export { isCancel }

/** GET /search?keyword=&userId= → mảng sản phẩm */
export async function searchProducts(keyword, userId = DEMO_USER_ID, signal) {
  const { data } = await api.get('/search', {
    params: { keyword, userId },
    signal,
  })
  return data
}

/** POST /interactions — type: 'CLICK' | 'CART' | 'BUY' */
export async function trackInteraction(productId, type, userId = DEMO_USER_ID) {
  await api.post('/interactions', { userId, productId, type })
}
