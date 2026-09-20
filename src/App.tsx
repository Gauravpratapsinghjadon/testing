import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { AccountInfo } from '@azure/msal-browser'
import { LoginPage } from './components/LoginPage'
import { SetupPage } from './components/SetupPage'
import { loadConfig, type AppConfig } from './config'
import { loginWithPopup, logout, trySilentLogin } from './auth/msal'
import { createConnectionSettings } from './copilotSettings'

type Screen = 'setup' | 'login' | 'chat'

const ChatPage = lazy(async () => {
  const module = await import('./components/ChatPage')
  return { default: module.ChatPage }
})

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(() => loadConfig())
  const [screen, setScreen] = useState<Screen>(config ? 'login' : 'setup')
  const [token, setToken] = useState<string | null>(null)
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const settings = useMemo(
    () => (config ? createConnectionSettings(config) : null),
    [config],
  )

  useEffect(() => {
    if (!settings || screen !== 'login' || token) {
      return
    }

    let cancelled = false
    setBusy(true)
    trySilentLogin(settings)
      .then((session) => {
        if (cancelled || !session) {
          return
        }
        setToken(session.token)
        setAccount(session.account)
        setScreen('chat')
      })
      .catch(() => {
        // Stay on the login screen and wait for a popup sign-in.
      })
      .finally(() => {
        if (!cancelled) {
          setBusy(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [settings, screen, token])

  async function handleLogin() {
    if (!settings) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const session = await loginWithPopup(settings)
      setToken(session.token)
      setAccount(session.account)
      setScreen('chat')
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Microsoft login failed.'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    if (!config) {
      return
    }
    try {
      await logout(config.appClientId, config.tenantId)
    } catch {
      // Local app state still resets if the popup is closed.
    }
    setToken(null)
    setAccount(null)
    setScreen('login')
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
    setScreen('login')
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
    <LoginPage
      userName={account?.username}
      busy={busy}
      error={error}
      onLogin={handleLogin}
      onChangeSettings={handleChangeSettings}
    />
  )
}
