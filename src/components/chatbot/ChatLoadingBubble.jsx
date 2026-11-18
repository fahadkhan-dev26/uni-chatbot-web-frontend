import { UNIVERSITY_LOGO } from '../../utils/branding';

export default function ChatLoadingBubble() {
  return (
    <div className="animate-fade-in flex items-start gap-3" role="status">
      <img src={UNIVERSITY_LOGO} alt="" className="mt-0.5 size-8 shrink-0 rounded-lg" />
      <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-brand-400" />
          <span className="ml-2 text-xs text-slate-500">
            Searching university documents…
          </span>
        </div>
      </div>
    </div>
  );
}
