import { AnimatePresence, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api.js'
import BulkBar from './components/BulkBar.jsx'
import Header from './components/Header.jsx'
import ProfileDialog from './components/ProfileDialog.jsx'
import Sidebar from './components/Sidebar.jsx'
import Stats from './components/Stats.jsx'
import Toast from './components/Toast.jsx'
import TodoForm from './components/TodoForm.jsx'
import TodoList from './components/TodoList.jsx'
import Toolbar from './components/Toolbar.jsx'
import { FILTERS, STATUS, matchesFilter, mergeOrder, plural } from './data.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [loadError, setLoadError] = useState(false)
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

  // ---- Server sync ----
  const reload = useCallback(() => {
    return Promise.all([api.getTodos(), api.getProfile()])
      .then(([todos, profile]) => {
        setTodos(todos)
        setUser(profile)
      })
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // Changes show up instantly; if the server rejects one, reload the real data.
  function save(promise) {
    return promise.catch(() => {
      setToast({ message: 'Could not save, reloaded from the server' })
      reload()
    })
  }

  // Deleted todos stay on the server until the undo toast goes away.
  const pendingDelete = useRef(null)
  const commitDelete = useCallback(() => {
    if (!pendingDelete.current) return
    api.deleteTodos([...pendingDelete.current]).catch(reload)
    pendingDelete.current = null
  }, [reload])

  useEffect(() => {
    addEventListener('pagehide', commitDelete)
    return () => removeEventListener('pagehide', commitDelete)
  }, [commitDelete])

  const closeToast = useCallback(() => {
    commitDelete()
    setToast(null)
  }, [commitDelete])

  // Removes todos and offers an undo; nothing is deleted on the server until the toast closes.
  function removeTodos(ids, message) {
    commitDelete()
    pendingDelete.current = ids
    setTodos(todos.filter((t) => !ids.has(t.id)))
    setSelected((prev) => new Set([...prev].filter((id) => !ids.has(id))))
    setToast({
      message,
      undo: () => {
        pendingDelete.current = null
        reload()
      },
    })
  }

  // Drag-and-drop fires on every step, so only save the order once it settles.
  const orderTimer = useRef(null)
  function reorder(reorderedVisible) {
    const next = mergeOrder(todos, reorderedVisible)
    setTodos(next)
    clearTimeout(orderTimer.current)
    orderTimer.current = setTimeout(() => save(api.saveOrder(next.map((t) => t.id))), 400)
  }

  // ---- CRUD ----
  function addTodo(title, status) {
    save(
      api.createTodo(title, status).then((todo) => {
        setTodos((prev) => [todo, ...prev])
        if (!matchesFilter(todo, filter)) setFilter('all')
      }),
    )
  }

  function updateTodo(id, changes) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, ...changes } : t)))
    save(api.updateTodo(id, changes))
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
    save(api.bulkSetStatus([...selected], status))
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

  if (!user) {
    return (
      <div className="empty" role="status">
        <strong>{loadError ? 'Could not reach the API' : 'Loading your tasks…'}</strong>
        {loadError && (
          <>
            Make sure the backend is running on port 3000.
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setLoadError(false)
                  reload()
                }}
              >
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    )
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
            onReorder={reorder}
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
                setUser({ ...user, ...next })
                save(api.updateProfile(next).then(() => setToast({ message: 'Profile updated' })))
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
