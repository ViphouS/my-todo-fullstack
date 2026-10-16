import { motion } from 'motion/react'
import { FILTERS, getInitials } from '../data.js'
import { INDICATOR } from '../motion.js'
import Icon from './Icon.jsx'

export default function Sidebar({ user, filter, counts, onFilterChange, onOpenProfile }) {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="check" />
        </span>
        My Todo
      </div>

      <div>
        <div className="nav-label" id="nav-status">
          Status
        </div>
        <nav className="nav" aria-labelledby="nav-status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              aria-current={filter === f.id}
              onClick={() => onFilterChange(f.id)}
            >
              {filter === f.id && (
                <motion.span layoutId="nav-active" className="active-pill" transition={INDICATOR} />
              )}
              <Icon name={f.icon} />
              <span>{f.label}</span>
              <span className="count">{counts[f.id]}</span>
            </button>
          ))}
        </nav>
      </div>

      <button className="profile-card" onClick={onOpenProfile} aria-haspopup="dialog">
        <span className="avatar">{getInitials(user.name)}</span>
        <span className="who">
          <strong>{user.name}</strong>
          <span>{user.role ? `${user.role} · ${user.email}` : user.email}</span>
        </span>
        <Icon name="settings" style={{ color: 'var(--muted-fg)' }} />
      </button>
    </aside>
  )
}
