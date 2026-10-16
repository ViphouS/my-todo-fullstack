// Run with: npm test
import assert from 'node:assert/strict'
import test from 'node:test'
import { getInitials, matchesFilter, mergeOrder, moveTodo } from './data.js'

const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const ids = (todos) => todos.map((t) => t.id).join('')

test('moveTodo places an item before or after the target', () => {
  assert.equal(ids(moveTodo(list, 'c', 'a', 'before')), 'cab')
  assert.equal(ids(moveTodo(list, 'a', 'c', 'after')), 'bca')
  assert.equal(ids(moveTodo(list, 'a', 'b', 'after')), 'bac')
  assert.equal(ids(list), 'abc') // original untouched
})

test('mergeOrder reorders visible todos and keeps hidden ones in place', () => {
  const all = [{ id: 'a' }, { id: 'x' }, { id: 'b' }, { id: 'c' }]
  // visible: a, b, c (x is filtered out) → user drags c to the top
  assert.equal(ids(mergeOrder(all, [{ id: 'c' }, { id: 'a' }, { id: 'b' }])), 'cxab')
})

test('matchesFilter handles status and starred', () => {
  assert.ok(matchesFilter({ status: 'done', starred: false }, 'all'))
  assert.ok(matchesFilter({ status: 'done', starred: false }, 'done'))
  assert.ok(!matchesFilter({ status: 'todo', starred: false }, 'starred'))
})

test('getInitials', () => {
  assert.equal(getInitials('Viphou Sarun'), 'VS')
  assert.equal(getInitials('  '), '?')
})
