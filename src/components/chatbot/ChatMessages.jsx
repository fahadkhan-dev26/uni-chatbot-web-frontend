import { useEffect, useRef } from 'react';
import ChatLoadingBubble from './ChatLoadingBubble';
import ChatMessage from './ChatMessage';

export default function ChatMessages({ messages, isSending }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-end gap-5 px-4 py-6 sm:px-6 sm:py-8"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isSending && <ChatLoadingBubble />}

      <div ref={endRef} />
    </div>
  );
}
