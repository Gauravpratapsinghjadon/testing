import { useEffect, useRef } from 'react'
import { hooks } from 'botframework-webchat'

type InitialMessageSenderProps = {
  text: string
}

export function InitialMessageSender({ text }: InitialMessageSenderProps) {
  const sendMessage = hooks.useSendMessage()
  const connectivity = hooks.useConnectivityStatus()
  const sentRef = useRef(false)
  const status = Array.isArray(connectivity) ? connectivity[0] : connectivity

  useEffect(() => {
    const message = text.trim()
    if (!message || sentRef.current || status !== 'connected') {
      return
    }

    sentRef.current = true
    sendMessage(message)
  }, [sendMessage, status, text])

  return null
}
