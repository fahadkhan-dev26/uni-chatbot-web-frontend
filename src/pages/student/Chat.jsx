import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ChatComposer from '../../components/chatbot/ChatComposer';
import ChatError from '../../components/chatbot/ChatError';
import ChatHeader from '../../components/chatbot/ChatHeader';
import ChatMessages from '../../components/chatbot/ChatMessages';
import ChatSidebar from '../../components/chatbot/ChatSidebar';
import ChatWelcome from '../../components/chatbot/ChatWelcome';
import Spinner from '../../components/common/Spinner';
import { useChat } from '../../hooks/useChat';

export default function Chat() {
  const chat = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const menuButton = menuButtonRef.current;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    drawerRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      menuButton?.focus();
    };
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleNewChat = () => {
    closeSidebar();
    chat.startNewChat();
  };

  const handleSelect = (id) => {
    closeSidebar();
    if (id !== chat.conversationId) chat.loadConversation(id);
  };

  const handleDelete = async (conversation) => {
    const result = await chat.deleteConversation(conversation.conversationId);
    if (result.ok) {
      toast.success('Conversation deleted');
    } else {
      toast.error(result.message);
    }
  };

  const renderSidebar = (onClose) => (
    <ChatSidebar
      conversations={chat.conversations}
      conversationId={chat.conversationId}
      deletingId={chat.deletingId}
      onNewChat={handleNewChat}
      onSelect={handleSelect}
      onDelete={handleDelete}
      onClose={onClose}
    />
  );

  const showConversation =
    chat.messages.length > 0 || chat.isSending;

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 lg:flex xl:w-80">
        {renderSidebar()}
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close conversation history"
          />
          <div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Conversation history"
            className="absolute inset-y-0 left-0 w-[86%] max-w-xs animate-fade-in shadow-2xl outline-none"
          >
            {renderSidebar(closeSidebar)}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onOpenMenu={() => setIsSidebarOpen(true)}
          onNewChat={handleNewChat}
          menuButtonRef={menuButtonRef}
        />

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/80 via-white to-white">
          {chat.isLoadingConversation ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-16">
              <Spinner />
              <p className="text-sm text-slate-500">Loading conversation…</p>
            </div>
          ) : chat.error?.type === 'load' ? (
            <ChatError
              variant="page"
              message={chat.error.message}
              onRetry={chat.retry}
              onNewChat={handleNewChat}
            />
          ) : showConversation ? (
            <ChatMessages
              messages={chat.messages}
              isSending={chat.isSending}
            />
          ) : (
            <ChatWelcome
              onSelect={chat.sendMessage}
              isSending={chat.isSending}
            />
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6 sm:pb-4 sm:pt-4">
          {chat.error?.type === 'send' && (
            <ChatError message={chat.error.message} onRetry={chat.retry} />
          )}
          <ChatComposer
            onSend={chat.sendMessage}
            isSending={chat.isSending}
            disabled={chat.isLoadingConversation}
          />
        </div>
      </div>
    </div>
  );
}
