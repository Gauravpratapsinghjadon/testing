import { useEffect, useRef } from 'react'
import { hooks } from 'botframework-webchat'

type InitialMessageSenderProps = {
  text: string
}

export function InitialMessageSender({ text }: InitialMessageSenderProps) {
  const sendMessage = hooks.useSendMessage()
  const [status] = hooks.useConnectivityStatus()
  const [activities] = hooks.useActivities()
  const sentRef = useRef(false)

  const botMessageCount = activities.filter((activity) => {
    const role = 'from' in activity ? activity.from?.role : undefined
    const textValue = 'text' in activity ? activity.text : undefined
    return (
      activity.type === 'message' &&
      role !== 'user' &&
      Boolean(typeof textValue === 'string' && textValue.trim())
    )
  }).length

  useEffect(() => {
    const message = text.trim()
    if (!message || sentRef.current || status !== 'connected') {
      return
    }

    const sendOnce = () => {
      if (sentRef.current) {
        return
      }
      sentRef.current = true
      sendMessage(message)
    }

    if (botMessageCount > 0) {
      const timer = window.setTimeout(sendOnce, 600)
      return () => window.clearTimeout(timer)
    }

    const fallback = window.setTimeout(sendOnce, 8000)
    return () => window.clearTimeout(fallback)
  }, [botMessageCount, sendMessage, status, text])

  return null
}
