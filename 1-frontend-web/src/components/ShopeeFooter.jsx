import React from 'react'

export default function ShopeeFooter() {
  return (
    <footer className="shopee-footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 8px', fontWeight: '700', color: 'var(--shopee-orange)', fontSize: '14px' }}>
          SHOPEE TEMPORAL RECSYS DEMO PLATFORM
        </p>
        <p style={{ margin: '0 0 14px', color: '#777' }}>
          Mô hình kết hợp Multi-Stream Temporal Fusion & GRU Compressor (M4_GRU) • Dữ liệu PostgreSQL 18 • Virtual Threads Java 21
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: '#888' }}>
          <span>CHÍNH SÁCH BẢO MẬT</span>
          <span>QUY CHẾ HOẠT ĐỘNG</span>
          <span>CHÍNH SÁCH VẬN CHUYỂN</span>
          <span>CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN</span>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#999' }}>
          © 2026 Shopee Temporal RecSys. Tất cả các quyền được bảo lưu.
        </p>
      </div>
    </footer>
  )
}
