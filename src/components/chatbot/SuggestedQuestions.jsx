import {
  Award,
  CalendarDays,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Languages,
} from 'lucide-react';

const questions = [
  {
    question: 'What are the admission requirements?',
    hint: 'Documents, grades and entry criteria',
    icon: ClipboardList,
  },
  {
    question: 'What are the tuition fees?',
    hint: 'Costs per semester and payment options',
    icon: DollarSign,
  },
  {
    question: 'Which undergraduate programs are available?',
    hint: 'Browse the degree catalogue',
    icon: GraduationCap,
  },
  {
    question: 'Are scholarships available?',
    hint: 'Merit and need-based funding',
    icon: Award,
  },
  {
    question: 'What is the application deadline?',
    hint: 'Important dates for this intake',
    icon: CalendarDays,
  },
  {
    question: 'What are the English language requirements?',
    hint: 'IELTS, TOEFL and accepted equivalents',
    icon: Languages,
  },
];

export default function SuggestedQuestions({ onSelect, disabled = false }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {questions.map(({ question, hint, icon: Icon }) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-none"
        >
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
            <Icon className="size-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-800 group-hover:text-brand-800">
              {question}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
