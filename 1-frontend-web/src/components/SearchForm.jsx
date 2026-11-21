import React, { useState, useEffect } from 'react'
import { Search, Calendar, User, Sparkles, Filter } from 'lucide-react'
import { PERSONAS, KEYWORD_LABELS, fetchKeywords, fetchDates } from '../services/api'

export default function SearchForm({ onSearch, loading }) {
  const [keywords, setKeywords] = useState([])
  const [selectedKeyword, setSelectedKeyword] = useState('ao_thun_nam')
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('latest')
  const [selectedPersona, setSelectedPersona] = useState(0)

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

  useEffect(() => {
    if (selectedKeyword) {
      fetchDates(selectedKeyword)
        .then((ds) => {
          setDates(ds || [])
          if (ds && ds.length > 0) {
            setSelectedDate(ds[0])
          } else {
            setSelectedDate('latest')
          }
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 mb-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top input bar: Keyword + Date + Submit */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Keyword Select */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-orange-500" /> Ngành hàng / Keyword
            </label>
            <div className="relative">
              <select
                value={selectedKeyword}
                onChange={(e) => setSelectedKeyword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 hover:border-orange-500 text-gray-800 text-sm rounded-xl px-3.5 py-2.5 outline-none transition focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                {keywords.map((kw) => (
                  <option key={kw} value={kw}>
                    {KEYWORD_LABELS[kw] || kw}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Select */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" /> Ngày dữ liệu (Snapshot)
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 hover:border-orange-500 text-gray-800 text-sm rounded-xl px-3.5 py-2.5 outline-none transition focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="latest">Mới nhất (Latest)</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang chấm điểm AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Tìm kiếm gợi ý AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs/Cards */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-orange-500" /> Persona người dùng (Temporal CTR Matching)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {PERSONAS.map((p) => {
              const isSelected = selectedPersona === p.id
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{p.icon}</span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-orange-700' : 'text-gray-800'
                      }`}
                    >
                      {p.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 line-clamp-1">{p.desc}</span>
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </div>
  )
}
