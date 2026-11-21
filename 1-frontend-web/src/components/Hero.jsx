import React from 'react'
import heroImage from '../assets/hero-shirts.png'

export default function Hero() {
  return (
    <section className="hero" id="new">
      <div className="hero-copy">
        <div>
          <p className="eyebrow">BỘ SƯU TẬP MỚI / 2026</p>
          <h1>
            MẶC.<br />
            CHẤT.<br />
            <em>RẤT RIÊNG.</em>
          </h1>
        </div>

        <div className="hero-bottom">
          <p>
            Những sản phẩm được chọn bằng mô hình chuỗi thời gian M4_GRU,<br />
            nhưng dành riêng cho cá tính & phong cách của bạn.
          </p>
          <a className="primary-button" href="#discovery">
            <span>KHÁM PHÁ NGAY</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img
          src={heroImage}
          alt="Bộ sưu tập tối giản màu đen, kem và cam đất"
        />
        <span className="image-label">TEMPORAL RECSYS / DROP 01</span>
        <span className="image-index">01—03</span>
      </div>
    </section>
  )
}
