const API = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api'

// The UI uses short status ids; the API uses the enum values from the DTO.
const TO_API = { todo: 'TODO', progress: 'IN_PROGRESS', done: 'DONE' }
const FROM_API = { TODO: 'todo', IN_PROGRESS: 'progress', DONE: 'done' }

const fromApi = ({ id, title, status, starred }) => ({ id, title, status: FROM_API[status], starred })

function toApi(changes) {
  return changes.status ? { ...changes, status: TO_API[changes.status] } : changes
}

// The access token lives in memory only; the refresh token is an httpOnly cookie.
let accessToken = null
let refreshing = null
let onSessionExpired = () => {}

const httpError = (res, method, path) =>
  Object.assign(new Error(`${method} ${path} failed with ${res.status}`), { status: res.status })

const saveToken = ({ accessToken: token }) => (accessToken = token)

// Every caller waits on the same request: the server rotates the cookie on use,
// so two refreshes in flight would look like a stolen token and end the session.
function refresh() {
  refreshing ??= fetch(API + '/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((res) => {
      if (!res.ok) throw httpError(res, 'POST', '/auth/refresh')
      return res.json()
    })
    .then(saveToken)
    .finally(() => (refreshing = null))
  return refreshing
}

async function request(path, { method = 'GET', body, keepalive, retry = true } = {}) {
  const res = await fetch(API + path, {
    method,
    credentials: 'include',
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: body && JSON.stringify(body),
    keepalive,
  })
  if (res.status === 401 && retry) {
    try {
      await refresh()
    } catch {
      accessToken = null
      onSessionExpired()
      throw httpError(res, method, path)
    }
    return request(path, { method, body, keepalive, retry: false })
  }
  if (!res.ok) throw httpError(res, method, path)
  return res.status === 204 ? null : res.json()
}

export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler
}

export const api = {
  // Brings the login back after a page reload, using the refresh cookie.
  restoreSession: () => refresh(),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, retry: false }).then(saveToken),
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: { email, password }, retry: false }),
  logout: () =>
    request('/auth/logout', { method: 'POST' })
      .catch(() => {})
      .finally(() => (accessToken = null)),

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
