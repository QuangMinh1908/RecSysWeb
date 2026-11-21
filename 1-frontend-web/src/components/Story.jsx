import React from 'react'

export default function Story({ totalCurated = 24 }) {
  return (
    <section className="story" id="story">
      <div className="story-copy">
        <p className="eyebrow">KHÔNG CHỈ LÀ MỘT MÓN ĐỒ</p>
        <h2>
          CHỌN ÍT HƠN.<br />
          MẶC <em>LÂU HƠN.</em>
        </h2>
        <p>
          Chúng tôi kết hợp gu thẩm mỹ cùng thuật toán gợi ý chuỗi thời gian M4_GRU để bạn tìm
          được món đồ thực sự thuộc về mình — không cuộn vô tận, không lựa chọn thừa, minh bạch về
          lịch sử biến động giá.
        </p>
        <a href="#discovery">
          <span>XEM GỢI Ý CỦA BẠN</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </a>
      </div>

      <div className="story-visual">
        <img
          src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85"
          alt="Không gian studio thời trang tối giản"
        />
        <div className="story-stat">
          <strong>{totalCurated}</strong>
          <span>
            mẫu được chọn lọc<br />
            theo đúng gu bạn
          </span>
        </div>
      </div>
    </section>
  )
}
