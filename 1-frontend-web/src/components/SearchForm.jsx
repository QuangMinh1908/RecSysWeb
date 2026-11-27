import { useEffect, useId, useState } from 'react'
import { BadgeCheck, CalendarDays, ChevronDown, LoaderCircle, PiggyBank, Search, Star, Tag, TrendingUp } from 'lucide-react'
import { PERSONAS, KEYWORD_LABELS, fetchKeywords, fetchDates } from '../services/api'

const preferenceLabels = [
  ['Săn ưu đãi', Tag],
  ['Theo xu hướng', TrendingUp],
  ['Ưu tiên chất lượng', Star],
  ['Tiết kiệm', PiggyBank],
  ['Tin thương hiệu', BadgeCheck],
]

export default function SearchForm({ onSearch, loading }) {
  const id = useId()
  const [keywords, setKeywords] = useState([])
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('latest')
  const [selectedPersona, setSelectedPersona] = useState(0)
  const [metadataError, setMetadataError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    fetchKeywords()
      .then((options) => {
        if (!active) return
        setKeywords(options)
        if (!options.length) setMetadataError('Chưa có ngành hàng để tìm kiếm.')
        setSelectedKeyword((current) => options.includes(current) ? current : options[0] || '')
      })
      .catch(() => {
        if (active) setMetadataError('Không thể tải ngành hàng.')
      })
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    if (!selectedKeyword) return
    let active = true
    fetchDates(selectedKeyword)
      .then((options) => {
        if (active) setDates(options || [])
      })
      .catch(() => {
        if (active) setMetadataError('Không thể tải danh sách ngày.')
      })
    return () => { active = false }
  }, [selectedKeyword, attempt])

  const handleKeywordChange = (event) => {
    setSelectedKeyword(event.target.value)
    setSelectedDate('latest')
    setDates([])
    setMetadataError('')
  }

  return (
    <form className="search-form" onSubmit={(event) => {
      event.preventDefault()
      if (!loading && selectedKeyword) onSearch({ keywordId: selectedKeyword, date: selectedDate, personaId: selectedPersona })
    }}>
      <div className="search-fields">
        <div className="search-field">
          <label htmlFor={`${id}-keyword`}>Ngành hàng</label>
          <div className="select-wrap">
            <Search size={17} aria-hidden="true" />
            <select id={`${id}-keyword`} value={selectedKeyword} onChange={handleKeywordChange} disabled={!keywords.length || loading}>
              {!keywords.length && <option value="">Chọn ngành hàng</option>}
              {keywords.map((keyword) => <option key={keyword} value={keyword}>{KEYWORD_LABELS[keyword] || keyword}</option>)}
            </select>
            <ChevronDown size={17} aria-hidden="true" />
          </div>
        </div>
        <div className="search-field">
          <label htmlFor={`${id}-date`}>Ngày dữ liệu</label>
          <div className="select-wrap">
            <CalendarDays size={17} aria-hidden="true" />
            <select id={`${id}-date`} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} disabled={!selectedKeyword || loading}>
              <option value="latest">Mới nhất</option>
              {dates.map((date) => <option key={date} value={date}>{date.split('-').reverse().join('/')}</option>)}
            </select>
            <ChevronDown size={17} aria-hidden="true" />
          </div>
        </div>
      </div>
      <fieldset className="persona-field" disabled={loading}>
        <legend>Gu mua sắm</legend>
        <div className="persona-options">
          {PERSONAS.map(({ id: personaId }) => {
            const [label, Icon] = preferenceLabels[personaId]
            return (
              <label className="persona-option" key={personaId}>
                <input type="radio" name={`${id}-persona`} checked={selectedPersona === personaId} onChange={() => setSelectedPersona(personaId)} />
                <span><Icon size={16} aria-hidden="true" />{label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <button className="primary-button search-submit" type="submit" disabled={loading || !selectedKeyword}>
        {loading ? <LoaderCircle className="spinner" size={19} aria-hidden="true" /> : <Search size={19} aria-hidden="true" />}
        {loading ? 'Đang tìm…' : 'Tìm sản phẩm'}
      </button>
      {metadataError && (
        <div className="metadata-error" role="alert">
          {metadataError}
          <button className="secondary-button" type="button" onClick={() => {
            setMetadataError('')
            setAttempt((value) => value + 1)
          }}>Thử lại</button>
        </div>
      )}
    </form>
  )
}
