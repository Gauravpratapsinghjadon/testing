import { useEffect, useRef } from 'react'
import { hooks } from 'botframework-webchat'
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client'

type InitialMessageSenderProps = {
  text: string
  connection: CopilotStudioWebChatConnection
}

export function InitialMessageSender({ text, connection }: InitialMessageSenderProps) {
  const sendMessage = hooks.useSendMessage()
  const sentRef = useRef(false)

  useEffect(() => {
    const message = text.trim()
    if (!message) {
      return
    }

    let timer = 0

    const sendOnce = () => {
      if (sentRef.current) {
        return
      }
      sentRef.current = true
      sendMessage(message)
    }

    const scheduleSend = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sendOnce, 250)
    }

    if (connection.connectionStatus$.value === 2) {
      scheduleSend()
    }

    const subscription = connection.connectionStatus$.subscribe((status) => {
      if (status === 2) {
        scheduleSend()
      }
    })

    return () => {
      window.clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [connection, sendMessage, text])

  return null
}
