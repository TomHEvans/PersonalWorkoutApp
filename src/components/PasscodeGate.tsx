import { useState } from 'react'
import type { FormEvent } from 'react'

export function PasscodeGate({
  error,
  onSubmit,
}: {
  error: boolean
  onSubmit: (token: string) => void
}) {
  const [value, setValue] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <div className="eyebrow">HYBRID TRAINING</div>
        <h1>Enter passcode</h1>
        <p className="muted">This tracker is private. Enter the app passcode to continue.</p>
        <input
          className="mono"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Passcode"
          aria-label="Passcode"
        />
        {error && <p className="error">Incorrect passcode — try again.</p>}
        <button type="submit" className="primary">
          Unlock
        </button>
      </form>
    </div>
  )
}
