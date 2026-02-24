import { useRef } from 'react'
import { useBoard } from '../../board/BoardContext'
import type { StatusFilter } from '../../board/types'
import { SearchIcon, XIcon } from '../../icons'
import './Toolbar.scss'

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'incomplete' },
  { label: 'Done', value: 'completed' },
]

export function Toolbar() {
  const { state, setSearchQuery, setStatusFilter } = useBoard()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <span className="toolbar__search-icon">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          className="toolbar__search-input"
          type="text"
          value={state.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
        />
        {state.searchQuery ? (
          <button className="toolbar__search-clear" onClick={handleClear} aria-label="Clear search">
            <XIcon />
          </button>
        ) : null}
      </div>

      <div className="toolbar__filters" role="group" aria-label="Filter by status">
        {FILTER_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            className={[
              'toolbar__filter-btn',
              state.statusFilter === value && 'toolbar__filter-btn--active',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setStatusFilter(value)}
            aria-pressed={state.statusFilter === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
