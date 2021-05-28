import React from 'react'
import { groupNullables } from './utils'
import {
  Message,
  MessageListDocument,
  useMessageListQuery,
  useMessageSendMutation,
} from './generated-types'

export default function Home(): JSX.Element {
  const messageListQuery = useMessageListQuery()
  const [messageSend, messageSendMutation] = useMessageSendMutation({
    update(cache, { data }) {
      const cacheQuery = cache.readQuery<{ MessageList: Message[] }>({
        query: MessageListDocument,
      })
      if (! cacheQuery) return
      if (data?.MessageSend?.id != null) {
        console.log('adding %O', data.MessageSend)
        cache.writeQuery({
          query: MessageListDocument,
          data: {
            MessageList: [data.MessageSend].concat(cacheQuery.MessageList),
          },
        })
      }
    },
  })
  const errors = groupNullables([messageListQuery.error, messageSendMutation.error])
  const messages = messageListQuery.data?.MessageList
  return (
    <div className="Home">
      <form
        onSubmit={event => {
          event.preventDefault()
          const formdata = Object.fromEntries(
            new FormData(event.target as HTMLFormElement).entries(),
          ) as { title: string; body: string }
          void messageSend({
            variables: { message: formdata as Pick<Message, 'title' | 'body'> },
            optimisticResponse: {
              MessageSend: { ...formdata, id: -999, createdAt: new Date().toISOString() },
            },
          })
        }}
      >
        <fieldset>
          <legend>send message</legend>
          <div>
            <label>
              <span>title:</span>
              <input type="text" name="title" placeholder="or username" />
            </label>
          </div>
          <div>
            <label>
              <span>message:</span>
              <textarea name="body" required aria-required />
            </label>
          </div>
          <div>
            <input type="submit" value="send" />
            {messageListQuery.loading && 'Loading...'}
            {messageSendMutation.loading && 'Sending...'}
          </div>
        </fieldset>
      </form>
      {errors && <pre className="wrap">{errors.map(e => e.message)}</pre>}
      {messages && (
        <ul className="message_list">
          {messages.slice(0).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(msg => (
            <li key={`${msg.id}_${msg.createdAt}`} className="message_entry">
              <div className="message">
                {msg.title && <b className="message_title">{msg.title}: </b>}
                <span className="message_body">{msg.body}</span>
              </div>
              <div className="message_time">{msg.createdAt}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
