const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// The UI uses short status ids; the API uses the enum values from the DTO.
const TO_API = { todo: 'TODO', progress: 'IN_PROGRESS', done: 'DONE' }
const FROM_API = { TODO: 'todo', IN_PROGRESS: 'progress', DONE: 'done' }

const fromApi = ({ id, title, status, starred }) => ({ id, title, status: FROM_API[status], starred })

function toApi(changes) {
  return changes.status ? { ...changes, status: TO_API[changes.status] } : changes
}

async function request(path, { method = 'GET', body, keepalive } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body && JSON.stringify(body),
    keepalive,
  })
  if (!res.ok) throw new Error(`${method} ${path} failed with ${res.status}`)
  return res.status === 204 ? null : res.json()
}

export const api = {
  getTodos: () => request('/todos').then((todos) => todos.map(fromApi)),
  createTodo: (title, status) =>
    request('/todos', { method: 'POST', body: toApi({ title, status }) }).then(fromApi),
  updateTodo: (id, changes) =>
    request(`/todos/${id}`, { method: 'PATCH', body: toApi(changes) }).then(fromApi),
  bulkSetStatus: (ids, status) => request('/todos/bulk', { method: 'PATCH', body: toApi({ ids, status }) }),
  // keepalive lets a pending delete finish even if the tab is closing.
  deleteTodos: (ids) => request('/todos/bulk', { method: 'DELETE', body: { ids }, keepalive: true }),
  saveOrder: (ids) => request('/todos/order', { method: 'PATCH', body: { ids } }),

  getProfile: () => request('/profile'),
  updateProfile: (profile) => request('/profile', { method: 'PATCH', body: profile }),
}
