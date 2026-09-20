type LoginPageProps = {
  userName?: string
  busy: boolean
  error: string | null
  onLogin: () => void
  onChangeSettings: () => void
}

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}

export function LoginPage({
  userName,
  busy,
  error,
  onLogin,
  onChangeSettings,
}: LoginPageProps) {
  return (
    <div className="page">
      <div className="card">
        <p className="eyebrow">Secure sign-in</p>
        <h1>Sign in to open the bot</h1>
        <p className="lede">
          Use your Microsoft work account. After MSAL login succeeds, Copilot
          Studio chat will start automatically.
        </p>

        {error ? <div className="banner error">{error}</div> : null}

        <button className="ms-login" type="button" onClick={onLogin} disabled={busy}>
          <MicrosoftLogo />
          {busy ? 'Signing in…' : 'Sign in with Microsoft'}
        </button>

        {userName ? (
          <p className="hint">Last signed-in account: {userName}</p>
        ) : null}

        <button className="link" type="button" onClick={onChangeSettings}>
          Change Environment ID / Client ID
        </button>
      </div>
    </div>
  )
}
