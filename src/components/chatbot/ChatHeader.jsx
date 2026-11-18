import { Link } from 'react-router-dom';
import { PanelLeft, SquarePen } from 'lucide-react';
import { UNIVERSITY_LOGO, UNIVERSITY_NAME, UNIVERSITY_TAGLINE } from '../../utils/branding';

export default function ChatHeader({ onOpenMenu, onNewChat, menuButtonRef }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-slate-200 bg-white px-2.5 sm:px-4 lg:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label="Open conversation history"
      >
        <PanelLeft className="size-5" />
      </button>

      <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5">
        <img src={UNIVERSITY_LOGO} alt="" className="size-7 rounded-lg" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {UNIVERSITY_NAME}
          </span>
          <span className="block text-[10px] uppercase tracking-wide text-slate-500">
            {UNIVERSITY_TAGLINE}
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={onNewChat}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label="Start a new chat"
      >
        <SquarePen className="size-5" />
      </button>
    </header>
  );
}
