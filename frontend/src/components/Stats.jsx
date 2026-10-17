import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { FILL, LEAVE, ROLL } from '../motion.js'

// Rolls the old value out and the new one in: up when it grows, down when it shrinks.
function RollingNumber({ value, suffix = '' }) {
  const [previous, setPrevious] = useState(value)
  const [direction, setDirection] = useState(1)
  if (value !== previous) {
    setDirection(value > previous ? 1 : -1)
    setPrevious(value)
  }

  return (
    <div className="v roll">
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          variants={{
            enter: (d) => ({ y: d * 20, opacity: 0 }),
            center: { y: 0, opacity: 1 },
            exit: (d) => ({ y: d * -20, opacity: 0, transition: LEAVE }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={ROLL}
        >
          {value}
          {suffix}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export default function Stats({ counts }) {
  const percent = counts.all ? Math.round((counts.done / counts.all) * 100) : 0

  return (
    <section className="stats" aria-label="Progress">
      <div className="stat">
        <div className="k">Completed</div>
        <RollingNumber value={percent} suffix="%" />
        <div
          className="bar"
          role="progressbar"
          aria-label="Completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <motion.i initial={false} animate={{ width: `${percent}%` }} transition={FILL} />
        </div>
      </div>
      <div className="stat">
        <div className="k">
          <span className="dot" style={{ background: '#F59E0B' }} />
          In progress
        </div>
        <RollingNumber value={counts.progress} />
      </div>
      <div className="stat">
        <div className="k">
          <span className="dot" style={{ background: '#64748B' }} />
          To do
        </div>
        <RollingNumber value={counts.todo} />
      </div>
    </section>
  )
}
