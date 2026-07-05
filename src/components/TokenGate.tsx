import { useState } from 'react'
import { setToken } from '../lib/api'

// One-time entry of the shared bearer token (checked by the Worker as
// X-App-Token). Stored in localStorage; re-shown on 401.
export default function TokenGate({ denied, onDone }: { denied: boolean; onDone: () => void }) {
  const [value, setValue] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const token = value.trim()
    if (!token) return
    setToken(token)
    onDone()
  }

  return (
    <div className="gate">
      <h1>ATHX</h1>
      <p className="gate-sub">Training tracker</p>
      <form onSubmit={submit}>
        <input
          type="password"
          inputMode="text"
          autoComplete="current-password"
          placeholder="App token"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn primary" disabled={!value.trim()}>
          Enter
        </button>
      </form>
      {denied && <p className="gate-error">Token rejected — check and try again.</p>}
    </div>
  )
}
