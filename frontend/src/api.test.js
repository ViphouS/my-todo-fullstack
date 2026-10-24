import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

const json = (status, body) => new Response(body ? JSON.stringify(body) : null, { status })

let calls
let routes

// Each route is a function of the request; calls are recorded as "METHOD path (token)".
globalThis.fetch = async (url, { method = 'GET', headers = {} }) => {
  const path = new URL(url).pathname.replace('/api', '')
  calls.push(`${method} ${path} ${headers.Authorization ?? '-'}`)
  await new Promise((resolve) => setTimeout(resolve, 5))
  return routes[`${method} ${path}`](headers)
}

const { api, setSessionExpiredHandler } = await import('./api.js')

beforeEach(async () => {
  calls = []
  routes = {
    'POST /auth/login': () => json(200, { accessToken: 'old' }),
    'POST /auth/logout': () => json(204),
  }
  await api.login('a@x.com', 'password1')
  calls = []
})

test('two requests that both hit 401 share one refresh, then retry with the new token', async () => {
  let refreshes = 0
  routes['POST /auth/refresh'] = () => (refreshes++, json(200, { accessToken: 'new' }))
  routes['GET /todos'] = (h) => (h.Authorization === 'Bearer new' ? json(200, []) : json(401))
  routes['GET /profile'] = (h) => (h.Authorization === 'Bearer new' ? json(200, { name: 'A' }) : json(401))

  const [todos, profile] = await Promise.all([api.getTodos(), api.getProfile()])

  assert.deepEqual(todos, [])
  assert.equal(profile.name, 'A')
  assert.equal(refreshes, 1)
})

test('a failed refresh signs the user out instead of retrying forever', async () => {
  let expired = 0
  setSessionExpiredHandler(() => expired++)
  routes['POST /auth/refresh'] = () => json(401)
  routes['GET /todos'] = () => json(401)

  await assert.rejects(api.getTodos(), { status: 401 })

  assert.equal(expired, 1)
  assert.equal(calls.filter((c) => c.startsWith('GET /todos')).length, 1)
})

test('a wrong password is reported as 401 without trying to refresh', async () => {
  routes['POST /auth/login'] = () => json(401)

  await assert.rejects(api.login('a@x.com', 'wrong'), { status: 401 })

  assert.ok(!calls.some((c) => c.includes('/auth/refresh')))
})

test('a 401 on retry is not retried again', async () => {
  routes['POST /auth/refresh'] = () => json(200, { accessToken: 'new' })
  routes['GET /todos'] = () => json(401)

  await assert.rejects(api.getTodos(), { status: 401 })

  assert.equal(calls.filter((c) => c.startsWith('GET /todos')).length, 2)
})
