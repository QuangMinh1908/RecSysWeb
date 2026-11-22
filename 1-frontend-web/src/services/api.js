import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const PERSONAS = [
  { id: 0, label: 'Deal Hunter', desc: 'Săn sale & giảm giá', icon: '🏷️' },
  { id: 1, label: 'Trend Chaser', desc: 'Xu hướng thị trường', icon: '🔥' },
  { id: 2, label: 'Quality Seeker', desc: 'Đánh giá sao cao', icon: '⭐' },
  { id: 3, label: 'Frugal', desc: 'Tiết kiệm chi phí', icon: '💰' },
  { id: 4, label: 'Brand Loyalist', desc: 'Thương hiệu uy tín', icon: '🏆' },
]

export const KEYWORD_LABELS = {
  chuot_khong_day: 'Chuột Không Dây',
  laptop: 'Laptop & Máy Tính',
  sua: 'Sữa & Bỉm',
  tai_nghe_khong_day: 'Tai Nghe Không Dây',
}

export async function fetchKeywords() {
  const { data } = await api.get('/meta/keywords')
  return data
}

export async function fetchDates(keywordId) {
  const { data } = await api.get(`/meta/dates/${keywordId}`)
  return data
}

export async function searchRecommendation({ keywordId, date, personaId, userId = 1 }) {
  const { data } = await api.post('/search', {
    keywordId,
    date,
    personaId,
    userId,
    page: 1,
  })
  return data
}

export async function fetchNextPage(sessionId, page) {
  const { data } = await api.get('/search', {
    params: { sessionId, page },
  })
  return data
}

export function formatVND(value) {
  if (value == null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function getImageUrl(rawPath) {
  if (!rawPath) return 'https://placehold.co/300x300?text=No+Image'
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath
  
  // Trích xuất tên file ảnh từ các định dạng path như:
  // - /home/ds300/Demo-Web/dataset/image/46369259273_a1f00d3e.jpg -> 46369259273_a1f00d3e.jpg
  // - image/46369259273_a1f00d3e.jpg -> 46369259273_a1f00d3e.jpg
  // - /home/ds300/data/image/2026-11-21/158941031_main.jpg -> 2026-11-21/158941031_main.jpg
  const match = rawPath.match(/image\/(.+)$/)
  if (match) {
    return `${API_BASE_URL}/images/${match[1]}`
  }
  return rawPath
}
