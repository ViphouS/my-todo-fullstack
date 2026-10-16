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

export const initialUser = {
  name: 'Viphou Sarun',
  email: 'viphou@example.com',
  role: 'Student',
}

export const initialTodos = [
  { id: 't1', title: 'Finish React todo assignment', status: 'progress', starred: true },
  { id: 't2', title: 'Read about useState and props', status: 'done', starred: false },
  { id: 't3', title: 'Design the profile section', status: 'todo', starred: false },
  { id: 't4', title: 'Add drag and drop reordering', status: 'todo', starred: true },
  { id: 't5', title: 'Write README with screenshots', status: 'todo', starred: false },
  { id: 't6', title: 'Push project to GitHub', status: 'progress', starred: false },
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
