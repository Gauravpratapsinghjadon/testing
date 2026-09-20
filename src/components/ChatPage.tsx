import { useEffect, useMemo, useState } from 'react'
import { Components } from 'botframework-webchat'
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme'
import {
  CopilotStudioClient,
  CopilotStudioWebChat,
  type CopilotStudioWebChatConnection,
} from '@microsoft/agents-copilotstudio-client'
import type { AccountInfo } from '@azure/msal-browser'
import type { AppConfig } from '../config'
import { createConnectionSettings } from '../copilotSettings'

const { BasicWebChat, Composer } = Components

type ChatPageProps = {
  config: AppConfig
  token: string
  account: AccountInfo | null
  onLogout: () => void
  onChangeSettings: () => void
}

const styleOptions = {
  accent: '#7c6af7',
  backgroundColor: 'transparent',
  bubbleBackground: '#161b2e',
  bubbleTextColor: '#eef1ff',
  bubbleBorderRadius: 16,
  bubbleFromUserBackground: '#7c6af7',
  bubbleFromUserTextColor: '#ffffff',
  bubbleFromUserBorderRadius: 16,
  hideUploadButton: true,
  sendBoxBackground: '#121627',
  sendBoxTextColor: '#eef1ff',
  sendBoxButtonColor: '#b7a9ff',
  sendBoxBorderTop: '1px solid rgba(255,255,255,0.08)',
  suggestedActionBackgroundColor: '#1c2340',
  suggestedActionTextColor: '#eef1ff',
}

export function ChatPage({
  config,
  token,
  account,
  onLogout,
  onChangeSettings,
}: ChatPageProps) {
  const [connection, setConnection] = useState<CopilotStudioWebChatConnection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const displayName = account?.name || account?.username || 'Signed in'

  const settings = useMemo(() => createConnectionSettings(config), [config])

  useEffect(() => {
    let active = true
    let created: CopilotStudioWebChatConnection | null = null

    try {
      const client = new CopilotStudioClient(settings, token)
      created = CopilotStudioWebChat.createConnection(client, { showTyping: true })
      if (active) {
        setConnection(created)
      }
    } catch (caught) {
      if (active) {
        setError(caught instanceof Error ? caught.message : 'Could not open Copilot Studio chat.')
      }
    }

    return () => {
      active = false
      if (created && typeof created.end === 'function') {
        created.end()
      }
    }
  }, [settings, token])

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div>
          <p className="eyebrow">Copilot Studio</p>
          <strong>Agent chat</strong>
        </div>
        <div className="chat-actions">
          <span className="user-chip" title={account?.username}>
            {displayName}
          </span>
          <button className="ghost" type="button" onClick={onChangeSettings}>
            Settings
          </button>
          <button className="ghost" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {error ? <div className="banner error">{error}</div> : null}

      <div className="webchat">
        {connection ? (
          <FluentThemeProvider>
            <Composer directLine={connection} styleOptions={styleOptions}>
              <BasicWebChat />
            </Composer>
          </FluentThemeProvider>
        ) : (
          <div className="loading">Opening bot…</div>
        )}
      </div>
    </div>
  )
}
