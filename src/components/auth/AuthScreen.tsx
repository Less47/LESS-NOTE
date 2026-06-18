import { useState, type FormEvent } from 'react'

import { authClient } from '../../auth/authClient'
import '../../auth.css'

type AuthScreenProps = {
  isLoading?: boolean
  title?: string
  message?: string
  errorMessage?: string | null
  onRetry?: (() => void) | null
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

function AuthScreen({
  isLoading = false,
  title = 'Welcome back',
  message = 'Sign in to load your boards, or create an account to start your own workspace.',
  errorMessage = null,
  onRetry = null,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'sign-up') {
        const { error } = await authClient.signUp.email({
          name: name.trim() || email.trim(),
          email: email.trim(),
          password,
        })

        if (error) {
          setFormError(getErrorMessage(error))
          return
        }
      } else {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
        })

        if (error) {
          setFormError(getErrorMessage(error))
          return
        }
      }
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-orbit auth-orbit-one" />
      <div className="auth-orbit auth-orbit-two" />
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="auth-eyebrow">LESS NOTE</p>
          <h1>{title}</h1>
          <p>{message}</p>
        </div>

        {isLoading ? (
          <div className="auth-status-card">
            <div className="auth-spinner" aria-hidden="true" />
            <p>{errorMessage ?? 'Loading your workspace...'}</p>
            {onRetry ? (
              <button type="button" className="auth-secondary-button" onClick={onRetry}>
                Retry
              </button>
            ) : null}
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={mode === 'sign-in' ? 'is-active' : undefined}
                onClick={() => setMode('sign-in')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={mode === 'sign-up' ? 'is-active' : undefined}
                onClick={() => setMode('sign-up')}
              >
                Create account
              </button>
            </div>

            {mode === 'sign-up' ? (
              <label className="auth-field">
                <span>Name</span>
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>Email</span>
              <input
                autoComplete="email"
                inputMode="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                minLength={8}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </label>

            {formError || errorMessage ? (
              <p className="auth-error" role="alert">
                {formError ?? errorMessage}
              </p>
            ) : null}

            <button className="auth-primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? mode === 'sign-up'
                  ? 'Creating account...'
                  : 'Signing in...'
                : mode === 'sign-up'
                ? 'Create account'
                : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthScreen
