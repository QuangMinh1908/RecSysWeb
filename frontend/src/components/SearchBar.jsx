import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ initialValue = '', onSearch }) {
  const [value, setValue] = useState(initialValue)

  const submit = (e) => {
    e.preventDefault() // Enter hoặc bấm nút đều đi qua đây
    onSearch(value.trim())
  }

  const clear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full">
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm áo thun, tai nghe, giày…"
          aria-label="Từ khóa tìm kiếm"
          className="h-11 w-full rounded-l-lg bg-white pl-9 pr-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:outline-offset-0"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Xóa từ khóa"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-line"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-r-lg bg-leaf px-4 text-sm font-semibold text-white transition-colors hover:bg-[#186a5e] sm:px-6"
      >
        Tìm kiếm
      </button>
    </form>
  )
}
