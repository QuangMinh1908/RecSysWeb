import React, { useState, useEffect } from 'react'
import { Search, Calendar, User } from 'lucide-react'
import { PERSONAS, KEYWORD_LABELS, fetchKeywords, fetchDates } from '../services/api'

export default function SearchForm({ onSearch, loading }) {
  const [keywords, setKeywords] = useState([])
  const [selectedKeyword, setSelectedKeyword] = useState('chuot_khong_day')
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('latest')
  const [selectedPersona, setSelectedPersona] = useState(0)

  // Fetch keywords once on mount
  useEffect(() => {
    fetchKeywords()
      .then((kws) => {
        if (kws && kws.length > 0) {
          setKeywords(kws)
          setSelectedKeyword(kws[0])
        }
      })
      .catch((err) => console.error('Failed to load keywords:', err))
  }, [])

  // Fetch dates when selectedKeyword changes (no auto search)
  useEffect(() => {
    if (selectedKeyword) {
      fetchDates(selectedKeyword)
        .then((ds) => {
          setDates(ds || [])
          setSelectedDate('latest')
        })
        .catch((err) => console.error('Failed to load dates:', err))
    }
  }, [selectedKeyword])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({
      keywordId: selectedKeyword,
      date: selectedDate,
      personaId: Number(selectedPersona),
    })
  }

  return (
    <div
      style={{
        background: 'var(--deep)',
        border: '1px solid var(--line)',
        borderRadius: '6px',
        padding: '20px',
        margin: '16px 3vw 0',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top input bar: Keyword + Date + Search Button */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px', alignItems: 'flex-end' }}>
          {/* Keyword Select */}
          <div style={{ gridColumn: 'span 5' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--orange)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                marginBottom: '6px',
              }}
            >
              <Search size={14} color="var(--orange)" /> Ngành hàng / Keyword
            </label>
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--dark)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '9px 12px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {keywords.map((kw) => (
                <option key={kw} value={kw} style={{ background: 'var(--dark)', color: 'var(--ink)' }}>
                  {KEYWORD_LABELS[kw] || kw}
                </option>
              ))}
            </select>
          </div>

          {/* Date Select */}
          <div style={{ gridColumn: 'span 4' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--orange)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                marginBottom: '6px',
              }}
            >
              <Calendar size={14} color="var(--orange)" /> Ngày dữ liệu (Snapshot)
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--dark)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '9px 12px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="latest" style={{ background: 'var(--dark)', color: 'var(--ink)' }}>
                Mới nhất (Latest)
              </option>
              {dates.map((d) => (
                <option key={d} value={d} style={{ background: 'var(--dark)', color: 'var(--ink)' }}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Search Button (Đúng chữ "Tìm kiếm") */}
          <div style={{ gridColumn: 'span 3' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '38px',
                background: 'var(--orange)',
                color: 'var(--dark)',
                border: 0,
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1,
                transition: 'background .15s',
              }}
            >
              {loading ? (
                <span>Đang tìm kiếm...</span>
              ) : (
                <>
                  <Search size={14} />
                  <span>Tìm kiếm</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Persona Selector Row */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--orange)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              marginBottom: '8px',
            }}
          >
            <User size={14} color="var(--orange)" /> Persona người dùng
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}
          >
            {PERSONAS.map((p) => {
              const isSelected = selectedPersona === p.id
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '4px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isSelected ? '2px solid var(--orange)' : '1px solid var(--line)',
                    background: isSelected ? 'rgba(255, 173, 36, 0.15)' : 'var(--dark)',
                    color: 'var(--ink)',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px' }}>{p.icon}</span>
                    <strong
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: isSelected ? 'var(--orange)' : 'var(--ink)',
                      }}
                    >
                      {p.label}
                    </strong>
                  </div>
                  <span style={{ fontSize: '10px', opacity: 0.65, lineHeight: 1.2 }}>
                    {p.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </div>
  )
}
