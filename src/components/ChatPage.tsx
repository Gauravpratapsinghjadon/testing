import { useEffect, useMemo, useState } from 'react'
import { Components } from 'botframework-webchat'
import {
  CopilotStudioClient,
  CopilotStudioWebChat,
  type CopilotStudioWebChatConnection,
} from '@microsoft/agents-copilotstudio-client'
import type { AccountInfo } from '@azure/msal-browser'
import type { AppConfig } from '../config'
import { createConnectionSettings } from '../copilotSettings'
import { InitialMessageSender } from './InitialMessageSender'

const { BasicWebChat, Composer } = Components

type ChatPageProps = {
  config: AppConfig
  token: string
  account: AccountInfo | null
  initialMessage: string
  onLogout: () => void
  onChangeSettings: () => void
  onNewChat: () => void
}

const styleOptions = {
  accent: '#5b5fc7',
  backgroundColor: '#ffffff',
  bubbleBackground: '#f3f5fa',
  bubbleTextColor: '#1b1f2a',
  bubbleBorderRadius: 16,
  bubbleFromUserBackground: '#5b5fc7',
  bubbleFromUserTextColor: '#ffffff',
  bubbleFromUserBorderRadius: 16,
  hideUploadButton: true,
  sendBoxBackground: '#ffffff',
  sendBoxTextColor: '#1b1f2a',
  sendBoxButtonColor: '#5b5fc7',
  sendBoxBorderTop: '1px solid #e6e9f2',
  suggestedActionBackgroundColor: '#f3f5fa',
  suggestedActionTextColor: '#1b1f2a',
  transcriptBackgroundColor: '#ffffff',
}

export function ChatPage({
  config,
  token,
  account,
  initialMessage,
  onLogout,
  onChangeSettings,
  onNewChat,
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
      created = CopilotStudioWebChat.createConnection(client, {
        showTyping: true,
        startConversation: true,
      })
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
  }, [initialMessage, settings, token])

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <strong>Anthro</strong>
        </div>
        <div className="chat-actions">
          <span className="user-chip" title={account?.username}>
            {displayName}
          </span>
          <button className="ghost" type="button" onClick={onNewChat}>
            New chat
          </button>
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
          <Composer directLine={connection} styleOptions={styleOptions}>
            {initialMessage.trim() ? <InitialMessageSender text={initialMessage} /> : null}
            <BasicWebChat />
          </Composer>
        ) : (
          <div className="loading">Opening bot…</div>
        )}
      </div>
    </div>
  )
}
