import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { getInitials } from '../data.js'
import { LEAVE, SURFACE } from '../motion.js'
import Icon from './Icon.jsx'

// Rendered inside AnimatePresence while open; the parent unmounts it to close,
// so the dialog stays open in the top layer while its exit animation plays.
export default function ProfileDialog({ user, doneCount, total, onSave, onClose }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState(user)
  const [showError, setShowError] = useState(false)

  // Layout effect: open the modal before the first paint so the enter animation is visible.
  useLayoutEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal()
  }, [])

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return setShowError(true)
    onSave({ name, email: form.email.trim(), role: form.role.trim() })
    onClose()
  }

  return (
    <motion.dialog
      ref={dialogRef}
      aria-labelledby="profile-title"
      // Escape: stop the instant native close and animate out instead.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: LEAVE }}
      transition={SURFACE}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="dlg-head">
          <h2 id="profile-title">Your profile</h2>
          <button type="button" className="ghost-icon" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>

        <div className="dlg-body">
          <div className="dlg-profile">
            <span className="avatar">{getInitials(form.name)}</span>
            <div>
              <strong style={{ color: 'var(--fg-strong)' }}>{user.name}</strong>
              <div style={{ fontSize: 14, color: 'var(--muted-fg)' }}>
                {doneCount} of {total} tasks completed
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="p-name">Display name</label>
            <input
              id="p-name"
              maxLength={40}
              value={form.name}
              onChange={update('name')}
              aria-invalid={showError && !form.name.trim()}
              aria-describedby="p-name-err"
            />
            {showError && !form.name.trim() && (
              <div className="err" id="p-name-err">
                Please enter your name.
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="p-email">Email</label>
            <input id="p-email" type="email" maxLength={80} value={form.email} onChange={update('email')} />
          </div>
          <div className="field">
            <label htmlFor="p-role">Role</label>
            <input id="p-role" maxLength={40} placeholder="e.g. Student" value={form.role} onChange={update('role')} />
          </div>
        </div>

        <div className="dlg-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </div>
      </form>
    </motion.dialog>
  )
}
