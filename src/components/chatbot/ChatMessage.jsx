import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Copy, Info, Paperclip, User } from 'lucide-react';
import ChatAnswerNotice from './ChatAnswerNotice';
import ChatCitations from './ChatCitations';
import MarkdownMessage from './MarkdownMessage';
import { UNIVERSITY_LOGO } from '../../utils/branding';
import { formatFileSize, formatTime } from '../../utils/format';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Answer copied');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy the answer');
    }
  };

  if (isUser) {
    return (
      <article className="animate-fade-in flex items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm sm:max-w-[75%]">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {message.attachments?.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {message.attachments.map((attachment, index) => (
                <li
                  key={`${attachment.name}-${index}`}
                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px]"
                >
                  <Paperclip className="size-3 shrink-0" aria-hidden="true" />
                  <span className="max-w-[10rem] truncate" title={attachment.name}>
                    {attachment.name}
                  </span>
                  {attachment.size > 0 && (
                    <span className="shrink-0 text-white/70">
                      {formatFileSize(attachment.size)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="mt-0.5 hidden size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 sm:flex">
          <User className="size-4" />
        </span>
      </article>
    );
  }

  return (
    <article className="animate-fade-in flex items-start gap-3">
      <img
        src={UNIVERSITY_LOGO}
        alt=""
        className="mt-0.5 size-8 shrink-0 rounded-lg"
      />
      <div className="min-w-0 max-w-[92%] flex-1 sm:max-w-[85%]">
        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
          <MarkdownMessage content={message.content} />

          <ChatCitations sources={message.sources} />

          <ChatAnswerNotice reason={message.meta?.reason} />

          {message.meta?.attachmentNotice && (
            <div
              role="status"
              className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800"
            >
              <Info className="mt-0.5 size-4 shrink-0" />
              <p className="text-xs leading-relaxed">{message.meta.attachmentNotice}</p>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
            <span className="text-[11px] text-slate-500">
              {formatTime(message.createdAt)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Copy answer"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
