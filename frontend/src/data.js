export const STATUS = {
  todo: 'To Do',
  progress: 'In Progress',
  done: 'Done',
}

export const FILTERS = [
  { id: 'all', label: 'All tasks', icon: 'list' },
  { id: 'todo', label: 'To Do', icon: 'circle' },
  { id: 'progress', label: 'In Progress', icon: 'clock' },
  { id: 'done', label: 'Done', icon: 'done' },
  { id: 'starred', label: 'Starred', icon: 'star' },
]

export function matchesFilter(todo, filter) {
  if (filter === 'all') return true
  if (filter === 'starred') return todo.starred
  return todo.status === filter
}

// Returns a new array with `id` placed before/after `targetId`.
export function moveTodo(todos, id, targetId, position) {
  const moving = todos.find((t) => t.id === id)
  const rest = todos.filter((t) => t.id !== id)
  const index = rest.findIndex((t) => t.id === targetId) + (position === 'after' ? 1 : 0)
  return [...rest.slice(0, index), moving, ...rest.slice(index)]
}

// Writes a new order of the visible (filtered) todos back into the full list,
// leaving hidden todos where they were.
export function mergeOrder(todos, reorderedVisible) {
  const visibleIds = new Set(reorderedVisible.map((t) => t.id))
  let next = 0
  return todos.map((t) => (visibleIds.has(t.id) ? reorderedVisible[next++] : t))
}

export function getInitials(name) {
  const letters = name.trim().split(/\s+/).slice(0, 2).map((word) => word[0])
  return letters.join('').toUpperCase() || '?'
}

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}
