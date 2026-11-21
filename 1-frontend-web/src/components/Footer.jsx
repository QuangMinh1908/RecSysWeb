import React from 'react'

export default function Footer() {
  return (
    <footer>
      <div>
        <a className="brand footer-brand" href="#">
          SÀN<span>•</span>STYLE
        </a>
        <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.65 }}>
          Sàn thương mại điện tử kết hợp Trí tuệ Nhân tạo & Chuỗi thời gian.
        </p>
      </div>

      <div>
        <p style={{ margin: 0 }}>Hệ thống phục vụ Virtual Threads Java 21 & PyTorch M4_GRU</p>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="#new">Trang chủ</a>
        <a href="#discovery">Khám phá</a>
        <a href="#shop">Gợi ý AI</a>
        <a href="#story">Về chúng tôi</a>
      </div>

      <span>© 2026 SÀN STYLE • Powered by Shopee Temporal RecSys</span>
    </footer>
  )
}
