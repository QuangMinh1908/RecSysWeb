import React from 'react'
import { PackageSearch } from 'lucide-react'

export default function EmptyState({ message = 'Chưa có kết quả tìm kiếm', subtext = 'Hãy chọn danh mục, ngày và persona rồi nhấn Tìm kiếm.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm my-6">
      <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{message}</h3>
      <p className="text-sm text-gray-500 max-w-md">{subtext}</p>
    </div>
  )
}
