import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

export default function Checkbox({ checked, indeterminate = false, onChange, label, disabled }) {
  const inputRef = useRef(null)

  // `indeterminate` is a DOM property only — it has no HTML attribute.
  useEffect(() => {
    inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className="checkbox">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span className="box">
        <Icon name="check" />
      </span>
    </label>
  )
}
