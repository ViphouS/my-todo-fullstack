import { AnimatePresence, motion, Reorder, useDragControls } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { CELL, LEAVE, POP } from '../motion.js'
import Checkbox from './Checkbox.jsx'
import Icon from './Icon.jsx'
import StatusSelect from './StatusSelect.jsx'

const LIFT_SHADOW = '0 1px 2px rgb(4 47 46 / .08), 0 14px 28px -16px rgb(4 47 46 / .5)'

// `ref` is forwarded so AnimatePresence's popLayout can measure the row on exit.
export default function TodoItem({
  ref,
  todo,
  selected,
  grabbed,
  onToggleSelect,
  onUpdate,
  onDelete,
  onHandleKey,
  onHandleBlur,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const dragControls = useDragControls()

  useEffect(() => {
    if (isEditing) inputRef.current.select()
  }, [isEditing])

  function startEditing() {
    setDraft(todo.title)
    setIsEditing(true)
  }

  function saveEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.title) onUpdate(todo.id, { title: trimmed })
    setIsEditing(false)
  }

  function handleEditKey(e) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') {
      setDraft(todo.title)
      setIsEditing(false)
    }
  }

  const classes = ['task']
  if (selected) classes.push('selected')
  if (todo.status === 'done') classes.push('is-done')
  if (grabbed) classes.push('grabbed')
  if (isDragging || grabbed) classes.push('lifted')

  return (
    <Reorder.Item
      as="li"
      ref={ref}
      value={todo}
      className={classes.join(' ')}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, scale: grabbed ? 1.02 : 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: LEAVE }}
      whileDrag={{ scale: 1.02, boxShadow: LIFT_SHADOW }}
      transition={CELL}
    >
      <button
        className="handle"
        aria-label={`Reorder ${todo.title}`}
        aria-pressed={grabbed}
        data-handle={todo.id}
        onPointerDown={(e) => dragControls.start(e)}
        onKeyDown={(e) => onHandleKey(todo, e)}
        onBlur={onHandleBlur}
      >
        <Icon name="grip" />
      </button>

      <Checkbox
        checked={selected}
        onChange={() => onToggleSelect(todo.id)}
        label={`Select ${todo.title}`}
      />

      <div className="title">
        {isEditing ? (
          <>
            <label className="sr-only" htmlFor={`edit-${todo.id}`}>
              Edit title
            </label>
            <input
              ref={inputRef}
              id={`edit-${todo.id}`}
              className="edit-input"
              value={draft}
              maxLength={120}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleEditKey}
              onBlur={saveEdit}
            />
          </>
        ) : (
          <span className="title-text" onDoubleClick={startEditing}>
            {todo.title}
          </span>
        )}
      </div>

      <label className="sr-only" htmlFor={`st-${todo.id}`}>
        Status
      </label>
      <StatusSelect
        id={`st-${todo.id}`}
        className="pill"
        value={todo.status}
        onChange={(status) => onUpdate(todo.id, { status })}
      />

      <div className="row-actions">
        <motion.button
          className="ghost-icon star"
          aria-pressed={todo.starred}
          aria-label={todo.starred ? 'Unstar task' : 'Star task'}
          onClick={() => onUpdate(todo.id, { starred: !todo.starred })}
          whileTap={{ scale: 0.85 }}
          transition={CELL}
        >
          <motion.span
            style={{ display: 'grid' }}
            initial={false}
            animate={{ scale: todo.starred ? [1, 1.35, 1] : 1, rotate: todo.starred ? [0, -15, 0] : 0 }}
            transition={POP}
          >
            <Icon name="star" />
          </motion.span>
        </motion.button>

        <button
          className="ghost-icon"
          aria-label={isEditing ? 'Save title' : 'Edit title'}
          // Keeps focus in the input so its blur doesn't save before this click.
          onMouseDown={(e) => isEditing && e.preventDefault()}
          onClick={isEditing ? saveEdit : startEditing}
        >
          <AnimatePresence initial={false}>
            <motion.span
              key={isEditing ? 'check' : 'pencil'}
              style={{ display: 'grid' }}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45, transition: LEAVE }}
              transition={CELL}
            >
              <Icon name={isEditing ? 'check' : 'pencil'} />
            </motion.span>
          </AnimatePresence>
        </button>

        <button
          className="ghost-icon danger"
          aria-label="Delete task"
          onClick={() => onDelete(todo.id)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </Reorder.Item>
  )
}
