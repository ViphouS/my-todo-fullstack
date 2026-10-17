import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { STATUS } from '../data.js'
import { CELL, LEAVE } from '../motion.js'
import Icon from './Icon.jsx'

// Custom listbox adapted from interior's dropdown (github.com/ddoemonn/interior).
const OPTIONS = Object.entries(STATUS).map(([value, label]) => ({ value, label }))
const DOT = { todo: '#64748B', progress: '#F59E0B', done: '#14B8A6' }
const OPEN = { type: 'spring', stiffness: 620, damping: 38, mass: 0.6 }
const SLIDE = { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 }
const ROW_H = 40 // must match .menu-item height
const MENU_W = 176

export default function StatusSelect({ value, onChange, id, className = 'select', placeholder }) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const selectedIndex = OPTIONS.findIndex((o) => o.value === value)

  function openMenu(index = Math.max(selectedIndex, 0)) {
    // Fixed position in a portal: rows are transformed (drag), so an in-row menu would sit under later rows.
    const r = triggerRef.current.getBoundingClientRect()
    const menuH = OPTIONS.length * ROW_H + 12
    const below = r.bottom + 6 + menuH <= innerHeight
    const width = Math.max(r.width, MENU_W)
    setPos({
      left: Math.min(r.left, innerWidth - width - 8),
      top: below ? r.bottom + 6 : r.top - 6 - menuH,
      minWidth: width,
      transformOrigin: below ? 'top left' : 'bottom left',
    })
    setActive(index)
    setOpen(true)
  }

  function close(refocus = true) {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  function choose(index) {
    onChange(OPTIONS[index].value)
    close()
  }

  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // Click outside, scroll (the fixed menu would drift), resize or leaving the window closes it.
  useEffect(() => {
    if (!open) return
    const dismiss = () => setOpen(false)
    const onPointerDown = (e) => {
      if (!triggerRef.current.contains(e.target) && !listRef.current?.contains(e.target)) dismiss()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    window.addEventListener('blur', dismiss)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('blur', dismiss)
    }
  }, [open])

  function handleTriggerKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu(OPTIONS.length - 1)
    }
  }

  function handleListKey(e) {
    const last = OPTIONS.length - 1
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + OPTIONS.length) % OPTIONS.length)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      setActive(e.key === 'Home' ? 0 : last)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(active)
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      close()
    } else if (e.key.length === 1) {
      // Type-ahead: "t", "i", "d" jump to the matching status.
      const match = OPTIONS.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (match >= 0) setActive(match)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`${className} dropdown-trigger`}
        data-s={value || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={handleTriggerKey}
      >
        {selectedIndex >= 0 ? OPTIONS[selectedIndex].label : placeholder}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="menu"
              style={{ position: 'fixed', ...pos }}
              initial={{ opacity: 0, scale: 0.94, y: pos.transformOrigin.startsWith('top') ? -8 : 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: LEAVE }}
              transition={{ ...OPEN, opacity: { duration: 0.12 } }}
            >
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-label="Status"
                tabIndex={-1}
                aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                onKeyDown={handleListKey}
              >
                <motion.span
                  aria-hidden="true"
                  className="menu-highlight"
                  initial={false}
                  animate={{ y: active * ROW_H, opacity: active < 0 ? 0 : 1 }}
                  transition={SLIDE}
                />
                {OPTIONS.map((option, i) => (
                  <li
                    key={option.value}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === selectedIndex}
                    className="menu-item"
                    onPointerMove={() => setActive(i)}
                    onClick={() => choose(i)}
                  >
                    <span className="dot" style={{ background: DOT[option.value] }} />
                    {option.label}
                    <motion.span
                      className="menu-check"
                      initial={false}
                      animate={{ opacity: i === selectedIndex ? 1 : 0, scale: i === selectedIndex ? 1 : 0.7 }}
                      transition={CELL}
                    >
                      <Icon name="check" />
                    </motion.span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
