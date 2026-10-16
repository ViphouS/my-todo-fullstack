import { AnimatePresence, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import BulkBar from './components/BulkBar.jsx'
import Header from './components/Header.jsx'
import ProfileDialog from './components/ProfileDialog.jsx'
import Sidebar from './components/Sidebar.jsx'
import Stats from './components/Stats.jsx'
import Toast from './components/Toast.jsx'
import TodoForm from './components/TodoForm.jsx'
import TodoList from './components/TodoList.jsx'
import Toolbar from './components/Toolbar.jsx'
import { FILTERS, STATUS, initialTodos, initialUser, matchesFilter, mergeOrder, plural } from './data.js'

export default function App() {
  const [user, setUser] = useState(initialUser)
  const [todos, setTodos] = useState(initialTodos)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState(null) // { message, undo? }
  const [theme, setTheme] = useState(null) // null = follow the OS

  const isDark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
  }, [theme])

  // Derived data — computed from state on every render, never stored.
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.id, todos.filter((t) => matchesFilter(t, f.id)).length]),
  )
  const q = query.trim().toLowerCase()
  const visibleTodos = todos.filter(
    (t) => matchesFilter(t, filter) && t.title.toLowerCase().includes(q),
  )

  const closeToast = useCallback(() => setToast(null), [])

  // Removes todos and offers an undo that restores the previous list.
  function removeTodos(ids, message) {
    const previous = todos
    setTodos(todos.filter((t) => !ids.has(t.id)))
    setSelected((prev) => new Set([...prev].filter((id) => !ids.has(id))))
    setToast({ message, undo: () => setTodos(previous) })
  }

  // ---- CRUD ----
  function addTodo(title, status) {
    setTodos([{ id: crypto.randomUUID(), title, status, starred: false }, ...todos])
    if (!matchesFilter({ status, starred: false }, filter)) setFilter('all')
  }

  function updateTodo(id, changes) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, ...changes } : t)))
  }

  function deleteTodo(id) {
    const title = todos.find((t) => t.id === id).title
    removeTodos(new Set([id]), `Deleted “${title.length > 28 ? title.slice(0, 28) + '…' : title}”`)
  }

  // ---- Selection & bulk actions ----
  function toggleSelect(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function selectAllVisible(checked) {
    const next = new Set(selected)
    visibleTodos.forEach((t) => (checked ? next.add(t.id) : next.delete(t.id)))
    setSelected(next)
  }

  function bulkSetStatus(status) {
    if (!status) return
    setTodos(todos.map((t) => (selected.has(t.id) ? { ...t, status } : t)))
    setToast({ message: `Moved ${plural(selected.size, 'task')} to ${STATUS[status]}` })
    setSelected(new Set())
  }

  function bulkDelete() {
    removeTodos(selected, `Deleted ${plural(selected.size, 'task')}`)
  }

  function changeFilter(id) {
    setFilter(id)
    setSelected(new Set())
  }

  return (
    // reducedMotion="user": with the OS "reduce motion" setting, movement is skipped but changes still show.
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Sidebar
          user={user}
          filter={filter}
          counts={counts}
          onFilterChange={changeFilter}
          onOpenProfile={() => setProfileOpen(true)}
        />

        <main>
          <Header
            user={user}
            total={counts.all}
            remaining={counts.all - counts.done}
            isDark={isDark}
            onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
            onOpenProfile={() => setProfileOpen(true)}
          />
          <Stats counts={counts} />
          <TodoForm onAdd={addTodo} />
          <Toolbar
            filter={filter}
            counts={counts}
            onFilterChange={changeFilter}
            query={query}
            onQueryChange={setQuery}
          />
          <TodoList
            todos={visibleTodos}
            label={FILTERS.find((f) => f.id === filter).label}
            query={q}
            selected={selected}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAllVisible}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            onReorder={(reorderedVisible) => setTodos(mergeOrder(todos, reorderedVisible))}
            bulkBar={
              <BulkBar
                count={selected.size}
                onSetStatus={bulkSetStatus}
                onDelete={bulkDelete}
                onClear={() => setSelected(new Set())}
              />
            }
          />
        </main>

        <AnimatePresence>
          {profileOpen && (
            <ProfileDialog
              user={user}
              doneCount={counts.done}
              total={counts.all}
              onSave={(next) => {
                setUser(next)
                setToast({ message: 'Profile updated' })
              }}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </AnimatePresence>

        <Toast
          toast={toast}
          onUndo={() => {
            toast.undo()
            closeToast()
          }}
          onClose={closeToast}
        />
      </div>
    </MotionConfig>
  )
}
