import { useState } from 'react'
import { PasscodeGate } from './components/PasscodeGate'
import { Tracker } from './components/Tracker'
import { clearToken, getToken, setToken } from './lib/api'

export default function App() {
  const [token, setTok] = useState<string | null>(() => getToken())
  const [authError, setAuthError] = useState(false)

  if (!token) {
    return (
      <PasscodeGate
        error={authError}
        onSubmit={(t) => {
          setToken(t)
          setTok(t)
          setAuthError(false)
        }}
      />
    )
  }

  return (
    <Tracker
      onAuthError={() => {
        // A 401 means the stored passcode is wrong — drop it and re-prompt.
        clearToken()
        setTok(null)
        setAuthError(true)
      }}
      onClearPasscode={() => {
        clearToken()
        setTok(null)
        setAuthError(false)
      }}
    />
  )
}
