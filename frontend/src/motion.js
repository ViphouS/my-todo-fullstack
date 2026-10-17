// Spring and easing values taken from interior (github.com/ddoemonn/interior).
export const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } // rows, small UI
export const SURFACE = { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 } // dialogs, bars
export const INDICATOR = { type: 'spring', stiffness: 620, damping: 42, mass: 0.35 } // active pill
export const FILL = { type: 'spring', stiffness: 210, damping: 34, mass: 0.9 } // progress bar
export const ROLL = { type: 'spring', stiffness: 460, damping: 32, mass: 0.55 } // counting numbers
export const POP = { type: 'spring', stiffness: 640, damping: 22, mass: 0.7 } // star burst
export const LEAVE = { duration: 0.14, ease: [0.4, 0, 1, 1] } // exits are faster than entries
