import { Sparkles } from 'lucide-react';
import { UNIVERSITY_LOGO, UNIVERSITY_NAME } from '../../utils/branding';
import SuggestedQuestions from './SuggestedQuestions';

export default function ChatWelcome({ onSelect, isSending }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <div className="relative mx-auto inline-flex">
          <img
            src={UNIVERSITY_LOGO}
            alt=""
            className="size-14 rounded-2xl shadow-soft"
          />
          <span className="absolute -right-1.5 -top-1.5 inline-flex size-6 items-center justify-center rounded-full border-2 border-white bg-brand-50 text-brand-600 shadow-sm">
            <Sparkles className="size-3" />
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How can I help you today?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-sm leading-relaxed text-slate-600 sm:text-base">
          Your university information assistant. Ask about admissions, courses,
          fees and more.
        </p>
      </div>

      <SuggestedQuestions onSelect={onSelect} disabled={isSending} />

      <p className="mt-8 text-center text-xs text-slate-500">
        Answers are grounded in official {UNIVERSITY_NAME} documents and include
        page-level citations.
      </p>
    </div>
  );
}
