import React, { useState } from 'react'
import { Message, useMessageListQuery, useMessageSendMutation } from './generated-types'

export default function Home(): JSX.Element {
  const messageListQuery = useMessageListQuery()
  const [messageSend, messageSendMutation] = useMessageSendMutation()
  const [debug, setDebug] = useState<unknown>(null)
  return (
    <div className="Home">
      {debug && <pre>{JSON.stringify(debug, null, 2)}</pre>}
      <form
        onSubmit={async event => {
          event.preventDefault()
          const formdata = Object.fromEntries(
            new FormData(event.target as HTMLFormElement).entries(),
          )
          const sendResult = await messageSend({ variables: { message: formdata as Message } })
          setDebug(sendResult)
        }}
      >
        <fieldset>
          <legend>send message</legend>
          <div>
            <label>
              <span>title:</span>
              <input type="text" name="title" />
            </label>
          </div>
          <div>
            <label>
              <span>message:</span>
              <textarea name="body" />
            </label>
          </div>
          <div>
            <input type="submit" value="send" />
          </div>
        </fieldset>
      </form>
      <pre>{JSON.stringify(messageListQuery, null, 2)}</pre>
      {messageSendMutation.error && <pre>{JSON.stringify(messageSendMutation.error, null, 2)}</pre>}
    </div>
  )
}
