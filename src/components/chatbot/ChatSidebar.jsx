import { Link } from 'react-router-dom';
import { Home, MessageSquareText, Plus, X } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { UNIVERSITY_LOGO, UNIVERSITY_NAME, UNIVERSITY_TAGLINE } from '../../utils/branding';
import { getInitials } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';

export default function ChatSidebar({
  conversations,
  conversationId,
  deletingId,
  onNewChat,
  onSelect,
  onDelete,
  onClose,
}) {
  const { user, isAdmin } = useAuth();
  const displayName = user?.name || 'Guest student';
  const subtitle = user?.email || 'Chats saved on this device';

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-3">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <img src={UNIVERSITY_LOGO} alt="" className="size-9 rounded-xl" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">
              {UNIVERSITY_NAME}
            </span>
            <span className="block text-[11px] text-slate-500">
              {UNIVERSITY_TAGLINE}
            </span>
          </span>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800"
            aria-label="Close conversation history"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="shrink-0 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>

      <nav
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 pb-3"
        aria-label="Conversation history"
      >
        <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Recent conversations
        </p>

        {conversations.length === 0 ? (
          <div className="mx-1 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center">
            <MessageSquareText className="mx-auto size-5 text-slate-400" />
            <p className="mt-2 text-xs font-medium text-slate-600">
              No conversations yet
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Your chats will appear here once you ask a question.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.conversationId}
                conversation={conversation}
                isActive={conversation.conversationId === conversationId}
                isDeleting={deletingId === conversation.conversationId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white">
            {getInitials(displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {isAdmin ? 'Administrator' : subtitle}
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back to university home"
            title="Back to home"
          >
            <Home className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
