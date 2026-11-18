import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatFileSize } from '../../utils/format';

const MAX_LENGTH = 1000;
const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp';

const ALLOWED_EXTENSIONS = new Set(
  ACCEPT.split(',').map((extension) => extension.slice(1)),
);
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

const extensionOf = (name = '') => name.split('.').pop()?.toLowerCase() ?? '';
const isImageFile = (file) => IMAGE_EXTENSIONS.has(extensionOf(file.name));

export default function ChatComposer({ onSend, isSending, disabled = false }) {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const addFiles = (selected) => {
    if (!selected.length || isSending || disabled) return;

    const accepted = [];

    for (const file of selected) {
      if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
        toast.error(
          `"${file.name}" is not supported. Use PDF, text, CSV, JSON or image files.`,
        );
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`"${file.name}" is larger than 10 MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (!accepted.length) return;

    const room = MAX_FILES - files.length;
    if (accepted.length > room) {
      toast.error(`Attach up to ${MAX_FILES} files per message.`);
    }

    const next = [...files, ...accepted.slice(0, Math.max(room, 0))];
    if (next.length > files.length) setFiles(next);
  };

  const handleFileChange = (event) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const submit = () => {
    if (isSending || disabled) return;

    const trimmed = value.trim();
    if (trimmed.length === 0 && files.length === 0) return;
    if (trimmed.length > 0 && trimmed.length < 3) return;

    const question =
      trimmed || 'Summarise the attached document(s) and highlight the key points.';

    onSend(question, files);
    setValue('');
    setFiles([]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const trimmedLength = value.trim().length;
  const canSend =
    (trimmedLength >= 3 || (trimmedLength === 0 && files.length > 0)) &&
    !isSending &&
    !disabled;
  const canAttach = !isSending && !disabled && files.length < MAX_FILES;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="rounded-2xl border border-slate-300 bg-white shadow-sm transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10"
      >
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-2 pr-1 text-xs text-slate-700"
              >
                {isImageFile(file) ? (
                  <ImageIcon className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                ) : (
                  <FileText className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                )}
                <span className="max-w-[9rem] truncate font-medium" title={file.name}>
                  {file.name}
                </span>
                <span className="shrink-0 text-[10px] text-slate-500">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isSending}
                  aria-label={`Remove ${file.name}`}
                  className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label htmlFor="chat-question" className="sr-only">
          Ask the university assistant
        </label>
        <textarea
          id="chat-question"
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about admissions, fees, courses…"
          className={cn(
            'max-h-40 w-full resize-none bg-transparent px-4 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60',
            files.length > 0 ? 'pt-2' : 'pt-3.5',
          )}
        />

        <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <input
              id="chat-attachments"
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              tabIndex={-1}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canAttach}
              aria-label="Attach files"
              title="Attach PDF, text, CSV, JSON or image files"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Paperclip className="size-4.5" />
            </button>

            {value.length > 900 ? (
              <span className="pl-0.5 text-[11px] font-medium text-amber-600">
                {value.length}/{MAX_LENGTH}
              </span>
            ) : (
              <span className="hidden truncate pl-0.5 text-[11px] text-slate-400 sm:block">
                Enter to send · Shift + Enter for a new line
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSend}
            aria-label={isSending ? 'Sending question' : 'Send question'}
            className={cn(
              'ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
              canSend
                ? 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
                : 'bg-slate-100 text-slate-400',
            )}
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      </form>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
        Attach PDF, text or image files (max {MAX_FILES}, 10 MB each). University
        AI can make mistakes. Verify important information with the university.
      </p>
    </div>
  );
}
