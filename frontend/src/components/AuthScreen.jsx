import { useState } from 'react'
import { api } from '../api.js'
import Icon from './Icon.jsx'

const MESSAGES = {
  login: { 401: 'Invalid email or password.' },
  register: {
    400: 'Enter a valid email and a password of at least 8 characters.',
    409: 'That email is already registered. Try signing in.',
  },
}

function errorMessage(mode, err) {
  if (err.status === 429) return 'Too many attempts. Wait a minute and try again.'
  return MESSAGES[mode][err.status] ?? 'Could not reach the API. Make sure the backend is running.'
}

export default function AuthScreen({ onDone }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    let step = mode
    try {
      if (!isLogin) {
        await api.register(email, password)
        step = 'login'
        setMode('login')
      }
      await api.login(email, password)
      onDone()
    } catch (err) {
      setError(errorMessage(step, err))
      setBusy(false)
    }
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand">
          <span className="brand-mark">
            <Icon name="check" />
          </span>
          My Todo
        </div>
        <div>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p>{isLogin ? 'Sign in to see your tasks.' : 'Sign up to start keeping track of your tasks.'}</p>
        </div>

        <div className="field">
          <label htmlFor="a-email">Email</label>
          <input
            id="a-email"
            type="email"
            autoComplete="email"
            maxLength={200}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby="a-error"
          />
        </div>
        <div className="field">
          <label htmlFor="a-password">Password</label>
          <input
            id="a-password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={isLogin ? undefined : 8}
            maxLength={128}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby="a-error"
          />
          {!isLogin && <div className="note">At least 8 characters.</div>}
        </div>

        <div className="err" id="a-error" role="alert">
          {error}
        </div>

        <button className="btn btn-primary" type="submit" disabled={busy || !email || !password}>
          {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
        <button type="button" className="link" onClick={switchMode}>
          {isLogin ? 'No account yet? Create one' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
