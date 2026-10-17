import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { FILTERS } from '../data.js'
import { INDICATOR } from '../motion.js'
import Icon from './Icon.jsx'

export default function Toolbar({ filter, counts, onFilterChange, query, onQueryChange }) {
  const searchRef = useRef(null)

  // Press "/" anywhere (outside a field) to jump to search.
  useEffect(() => {
    function handleKey(e) {
      const tag = document.activeElement.tagName
      if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
        e.preventDefault()
        searchRef.current.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="toolbar">
      {/* Pill tabs replace the sidebar on small screens */}
      <div className="tabs" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            aria-pressed={filter === f.id}
            onClick={() => onFilterChange(f.id)}
          >
            {filter === f.id && (
              <motion.span layoutId="tab-active" className="active-pill" transition={INDICATOR} />
            )}
            <span>
              {f.label} · {counts[f.id]}
            </span>
          </button>
        ))}
      </div>
      <div className="search">
        <Icon name="search" />
        <label htmlFor="q" className="sr-only">
          Search tasks
        </label>
        <input
          ref={searchRef}
          id="q"
          type="search"
          placeholder="Search by title"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  )
}
