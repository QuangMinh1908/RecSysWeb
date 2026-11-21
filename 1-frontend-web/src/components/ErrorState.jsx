import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-2xl text-center my-6">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-800 mb-1">Đã xảy ra lỗi khi tìm kiếm</h3>
      <p className="text-sm text-red-600 mb-4 max-w-md">{error || 'Không thể kết nối đến máy chủ hoặc mô hình gợi ý.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      )}
    </div>
  )
}
