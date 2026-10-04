import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { AccountInfo } from '@azure/msal-browser'

type BrandPageProps = {
  account: AccountInfo | null
  onStart: (message: string) => void
  onLogout: () => void
  onChangeSettings: () => void
}

function firstName(account: AccountInfo | null) {
  const full = account?.name?.trim()
  if (full) {
    return full.split(' ')[0]
  }
  const email = account?.username || ''
  return email.split('@')[0] || 'there'
}

export function BrandPage({
  account,
  onStart,
  onLogout,
  onChangeSettings,
}: BrandPageProps) {
  const [message, setMessage] = useState('')
  const canSend = Boolean(message.trim())

  function submit() {
    const text = message.trim()
    if (!text) {
      return
    }
    onStart(text)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="brand-page">
      <header className="chat-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <strong>Anthro</strong>
        </div>
        <div className="chat-actions">
          <span className="user-chip" title={account?.username}>
            {account?.name || account?.username || 'Signed in'}
          </span>
          <button className="ghost" type="button" onClick={onChangeSettings}>
            Settings
          </button>
          <button className="ghost" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="brand-hero">
        <span className="brand-mark brand-mark-lg" aria-hidden="true" />
        <h1>Hi {firstName(account)}, how can I help?</h1>
        <p className="lede">Ask your Copilot Studio agent. Your first message opens the chat.</p>

        <form className="brand-composer" onSubmit={onSubmit}>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message"
            rows={1}
            autoFocus
          />
          <button
            className="arrow-button"
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h12M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </main>
    </div>
  )
}
