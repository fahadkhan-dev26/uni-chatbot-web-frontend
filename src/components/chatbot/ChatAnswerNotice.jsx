import { FileQuestion, FileText, Info, ServerOff } from 'lucide-react';
import { cn } from '../../utils/cn';

const SERVICE_DOWN = {
  icon: ServerOff,
  tone: 'amber',
  title: 'AI service unavailable',
  text: 'The language model could not be reached, so this reply is a service notice rather than a document answer. Please try again in a moment.',
};

const NOTICES = {
  // The model is down but the answer quotes the matching document passage.
  'extractive-fallback': {
    icon: FileText,
    tone: 'amber',
    title: 'Showing the document passage',
    text: 'The AI summariser is temporarily unavailable, so the reply quotes the matching passage from the university documents instead of a written answer.',
  },
  'llm-unavailable': SERVICE_DOWN,
  // Emitted by older backend builds; same meaning as llm-unavailable.
  'ollama-unavailable': SERVICE_DOWN,
  'no-documents': {
    icon: FileQuestion,
    tone: 'slate',
    title: 'No documents to search',
    text: 'The university has not published any documents for the assistant yet.',
  },
  'no-relevant-documents': {
    icon: FileQuestion,
    tone: 'slate',
    title: 'No matching information',
    text: 'No passage in the university documents covers this question. Try rephrasing it or asking about admissions, courses or fees.',
  },
  'insufficient-context': {
    icon: Info,
    tone: 'slate',
    title: 'Not enough information',
    text: 'The matching document passages do not contain enough detail to answer this reliably.',
  },
};

const TONES = {
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
};

export default function ChatAnswerNotice({ reason }) {
  const notice = NOTICES[reason];
  if (!notice) return null;

  const Icon = notice.icon;

  return (
    <div
      role="status"
      className={cn(
        'mt-3 flex items-start gap-2.5 rounded-xl border px-3 py-2.5',
        TONES[notice.tone],
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold">{notice.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">
          {notice.text}
        </p>
      </div>
    </div>
  );
}
