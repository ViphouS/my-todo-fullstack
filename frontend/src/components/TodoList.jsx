import { AnimatePresence, Reorder } from 'motion/react'
import { useRef, useState } from 'react'
import { moveTodo, plural } from '../data.js'
import Checkbox from './Checkbox.jsx'
import Icon from './Icon.jsx'
import TodoItem from './TodoItem.jsx'

export default function TodoList({
  todos,
  label,
  query,
  selected,
  onToggleSelect,
  onSelectAll,
  onUpdate,
  onDelete,
  onReorder,
  bulkBar,
}) {
  // Keyboard reorder: Space grabs, arrows move, Space drops, Escape restores.
  const [grabbedId, setGrabbedId] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const snapshot = useRef(null)

  const selectedCount = todos.filter((t) => selected.has(t.id)).length
  const allSelected = todos.length > 0 && selectedCount === todos.length

  function position(id, list = todos) {
    return `position ${list.findIndex((t) => t.id === id) + 1} of ${list.length}`
  }

  function handleKey(todo, e) {
    const held = grabbedId === todo.id
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (held) {
        setGrabbedId(null)
        setAnnouncement(`${todo.title} dropped at ${position(todo.id)}.`)
      } else {
        snapshot.current = todos
        setGrabbedId(todo.id)
        setAnnouncement(`${todo.title} grabbed, ${position(todo.id)}.`)
      }
    } else if (held && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const index = todos.findIndex((t) => t.id === todo.id)
      const neighbour = todos[index + (e.key === 'ArrowUp' ? -1 : 1)]
      if (!neighbour) return
      const next = moveTodo(todos, todo.id, neighbour.id, e.key === 'ArrowUp' ? 'before' : 'after')
      onReorder(next)
      setAnnouncement(`${todo.title}, ${position(todo.id, next)}.`)
      // React may re-insert the row while moving it; put focus back on its handle.
      requestAnimationFrame(() => document.querySelector(`[data-handle="${todo.id}"]`)?.focus())
    } else if (held && e.key === 'Escape') {
      e.preventDefault()
      onReorder(snapshot.current)
      setGrabbedId(null)
      setAnnouncement('Reorder cancelled, original order restored.')
    }
  }

  return (
    <>
      <div className="list-head">
        <Checkbox
          checked={allSelected}
          indeterminate={selectedCount > 0 && !allSelected}
          disabled={todos.length === 0}
          onChange={onSelectAll}
          label="Select all visible tasks"
        />
        <span>{label}</span>
        <span className="spacer" />
        <span>{plural(todos.length, 'task')}</span>
        {bulkBar}
      </div>

      {todos.length === 0 ? (
        <div className="empty">
          <div className="ring">
            <Icon name={query ? 'search' : 'check'} />
          </div>
          <strong>{query ? 'No matching tasks' : 'Nothing here yet'}</strong>
          {query ? 'Try a different search term.' : 'Add a task above to fill this list.'}
        </div>
      ) : (
        <Reorder.Group as="ul" axis="y" values={todos} onReorder={onReorder} className="tasks">
          <AnimatePresence mode="popLayout" initial={false}>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                selected={selected.has(todo.id)}
                grabbed={grabbedId === todo.id}
                onToggleSelect={onToggleSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onHandleKey={handleKey}
                onHandleBlur={() => grabbedId === todo.id && setGrabbedId(null)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
      <p className="hint">
        Drag <Icon name="grip" style={{ verticalAlign: -4, opacity: 0.6 }} /> to reorder. With the
        keyboard, focus it and press <kbd>Space</kbd>, then <kbd>↑</kbd> <kbd>↓</kbd>,{' '}
        <kbd>Space</kbd> to drop or <kbd>Esc</kbd> to cancel. Double-click a title to edit.
      </p>
    </>
  )
}
