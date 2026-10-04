import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { AccountInfo } from '@azure/msal-browser'
import { SetupPage } from './components/SetupPage'
import { loadConfig, type AppConfig } from './config'
import { bootstrapAuth, logout } from './auth/msal'
import { createConnectionSettings } from './copilotSettings'

type Screen = 'setup' | 'connecting' | 'chat'

const ChatPage = lazy(async () => {
  const module = await import('./components/ChatPage')
  return { default: module.ChatPage }
})

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(() => loadConfig())
  const [screen, setScreen] = useState<Screen>(config ? 'connecting' : 'setup')
  const [token, setToken] = useState<string | null>(null)
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authAttempt, setAuthAttempt] = useState(0)

  const settings = useMemo(
    () => (config ? createConnectionSettings(config) : null),
    [config],
  )

  useEffect(() => {
    if (!settings || screen !== 'connecting') {
      return
    }

    let cancelled = false

    bootstrapAuth(settings)
      .then((result) => {
        if (cancelled) {
          return
        }
        if (result.status === 'redirecting') {
          return
        }
        setToken(result.session.token)
        setAccount(result.session.account)
        setError(null)
        setScreen('chat')
      })
      .catch((caught) => {
        if (cancelled) {
          return
        }
        setError(
          caught instanceof Error ? caught.message : 'Microsoft login failed.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [settings, screen, authAttempt])

  async function handleLogout() {
    if (!config) {
      return
    }
    setToken(null)
    setAccount(null)
    setScreen('connecting')
    try {
      await logout(config.appClientId, config.tenantId)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Microsoft logout failed.',
      )
    }
  }

  function handleChangeSettings() {
    setToken(null)
    setAccount(null)
    setError(null)
    setScreen('setup')
  }

  function handleSaved(nextConfig: AppConfig) {
    setConfig(nextConfig)
    setToken(null)
    setAccount(null)
    setError(null)
    setScreen('connecting')
    setAuthAttempt((current) => current + 1)
  }

  function retryLogin() {
    setError(null)
    setScreen('connecting')
    setAuthAttempt((current) => current + 1)
  }

  if (screen === 'setup') {
    return <SetupPage onSaved={handleSaved} />
  }

  if (screen === 'chat' && config && token) {
    return (
      <Suspense fallback={<div className="loading">Opening bot…</div>}>
        <ChatPage
          config={config}
          token={token}
          account={account}
          onLogout={handleLogout}
          onChangeSettings={handleChangeSettings}
        />
      </Suspense>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <p className="eyebrow">Microsoft sign-in</p>
        <h1>{error ? 'Could not sign in' : 'Signing you in'}</h1>
        <p className="lede">
          {error
            ? 'The app will send you to Microsoft login again.'
            : 'If this tenant already has a session, chat will open automatically. Otherwise you will be redirected to Microsoft login.'}
        </p>
        {error ? <div className="banner error">{error}</div> : null}
        {error ? (
          <button className="primary" type="button" onClick={retryLogin}>
            Continue to Microsoft login
          </button>
        ) : (
          <p className="hint">Redirecting…</p>
        )}
      </div>
    </div>
  )
}
