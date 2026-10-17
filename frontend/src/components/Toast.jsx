import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { LEAVE, SURFACE } from '../motion.js'

export default function Toast({ toast, onUndo, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  return (
    // The live region stays mounted so screen readers announce each new message.
    <div className="toast-wrap" role="status">
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key={toast.message}
            className="toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: LEAVE }}
            transition={SURFACE}
          >
            <span>{toast.message}</span>
            {toast.undo && <button onClick={onUndo}>Undo</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
