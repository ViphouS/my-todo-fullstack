import { useState } from 'react'
import Icon from './Icon.jsx'
import StatusSelect from './StatusSelect.jsx'

export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('todo')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, status)
    setTitle('')
  }

  return (
    <form className="composer" onSubmit={handleSubmit} autoComplete="off">
      <label htmlFor="new-title" className="sr-only">
        New task title
      </label>
      <input
        id="new-title"
        placeholder="Add a new task…"
        maxLength={120}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="new-status" className="sr-only">
        Status
      </label>
      <StatusSelect id="new-status" value={status} onChange={setStatus} />
      <button className="btn btn-primary" type="submit" disabled={!title.trim()}>
        <Icon name="plus" />
        Add
      </button>
    </form>
  )
}
