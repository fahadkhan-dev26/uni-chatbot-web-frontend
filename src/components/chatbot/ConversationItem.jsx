import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../../utils/format';
import { cn } from '../../utils/cn';

export default function ConversationItem({
  conversation,
  isActive,
  isDeleting,
  onSelect,
  onDelete,
}) {
  return (
    <li>
      <div
        className={cn(
          'group flex items-center rounded-xl border transition-colors',
          isActive
            ? 'border-slate-200 bg-white shadow-sm'
            : 'border-transparent hover:bg-white/70',
        )}
      >
        <button
          type="button"
          onClick={() => onSelect(conversation.conversationId)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-l-xl px-3 py-2.5 text-left"
          aria-current={isActive || undefined}
        >
          <MessageSquare
            className={cn(
              'size-4 shrink-0',
              isActive ? 'text-brand-600' : 'text-slate-400',
            )}
          />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                'block truncate text-sm',
                isActive
                  ? 'font-semibold text-slate-900'
                  : 'font-medium text-slate-700',
              )}
            >
              {conversation.title}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-slate-500">
              {formatRelativeTime(conversation.lastMessageAt)}
              {conversation.messageCount
                ? ` · ${conversation.messageCount} messages`
                : ''}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(conversation)}
          disabled={isDeleting}
          className="mr-1.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`Delete conversation: ${conversation.title}`}
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>
    </li>
  );
}
