import { AnimatePresence, motion } from 'motion/react'
import { LEAVE, SURFACE } from '../motion.js'
import Icon from './Icon.jsx'
import StatusSelect from './StatusSelect.jsx'

// Overlays the list header (which reserves its height), so showing it never shifts the list.
export default function BulkBar({ count, onSetStatus, onDelete, onClear }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="bulk"
          role="region"
          aria-label="Bulk actions"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, transition: LEAVE }}
          transition={SURFACE}
        >
          <strong>
            {count}
            <span className="sr-only-sm"> selected</span>
          </strong>
          <label htmlFor="bulk-status" className="sr-only">
            Set status for selected
          </label>
          <StatusSelect id="bulk-status" value="" placeholder="Status…" onChange={onSetStatus} />
          <button className="btn btn-ghost" onClick={onClear}>
            Clear
          </button>
          <button className="btn btn-danger" onClick={onDelete} aria-label="Delete selected">
            <Icon name="trash" />
            <span className="hide-sm">Delete</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
