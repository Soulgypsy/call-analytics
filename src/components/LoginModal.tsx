import { useState } from 'react'
import {
  login,
  signup,
  getRoleFromToken,
  type UserRole,
} from '@/api'

interface LoginModalProps {
  onLoginSuccess: (role: UserRole | null) => void
}

export function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsAuthenticating(true)

    try {
      await login(username.trim(), password)
      const role = getRoleFromToken()
      onLoginSuccess(role)
      setPassword('')
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsAuthenticating(true)

    try {
      await signup({
        username: username.trim(),
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: age ? Number(age) : undefined,
        role: 'ANALYST',
      })
      const role = getRoleFromToken()
      onLoginSuccess(role)
      setPassword('')
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-card text-card-foreground rounded-lg border p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Call Analytics</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-200">
            {error.message}
          </div>
        )}

        <div className="mb-4 flex gap-2">
          <button
            className={`flex-1 rounded-md border px-3 py-2 font-medium transition ${
              authMode === 'login'
                ? 'bg-foreground text-background dark:bg-foreground dark:text-background'
                : 'hover:bg-muted'
            }`}
            type="button"
            onClick={() => {
              setAuthMode('login')
              setError(null)
            }}
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-md border px-3 py-2 font-medium transition ${
              authMode === 'signup'
                ? 'bg-foreground text-background dark:bg-foreground dark:text-background'
                : 'hover:bg-muted'
            }`}
            type="button"
            onClick={() => {
              setAuthMode('signup')
              setError(null)
            }}
          >
            Sign up
          </button>
        </div>

        {authMode === 'login' ? (
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="rounded-md bg-foreground text-background px-4 py-2 disabled:opacity-50 font-medium transition hover:opacity-90"
              type="submit"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSignup}>
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="number"
              min={0}
              placeholder="Age (optional)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <input
              className="rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              className="rounded-md bg-foreground text-background px-4 py-2 disabled:opacity-50 font-medium transition hover:opacity-90"
              type="submit"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
