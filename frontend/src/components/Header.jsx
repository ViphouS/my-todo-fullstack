import Icon from './Icon.jsx'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Header({ user, remaining, total, isDark, onToggleTheme, onOpenProfile, onLogout }) {
  const firstName = user.name.split(' ')[0]

  let summary = 'Add your first task to get started.'
  if (total > 0) {
    summary = remaining
      ? `You have ${remaining} task${remaining === 1 ? '' : 's'} left. Keep going!`
      : 'All tasks done. Nice work!'
  }

  return (
    <header className="topbar">
      <div className="greet">
        <h1>
          {greeting()}, {firstName}
        </h1>
        <p>{summary}</p>
      </div>
      <div className="top-actions">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} />
        </button>
        <button
          className="icon-btn mobile-only"
          onClick={onOpenProfile}
          aria-label="Open profile"
          aria-haspopup="dialog"
        >
          <Icon name="user" />
        </button>
        <button className="icon-btn" onClick={onLogout} aria-label="Sign out">
          <Icon name="logout" />
        </button>
      </div>
    </header>
  )
}
