import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BookOpenCheck,
  FileText,
  MessagesSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { API_BASE_URL } from '../../services/api';
import { cn } from '../../utils/cn';

const features = [
  {
    icon: MessagesSquare,
    title: 'Ask in plain language',
    text: 'Students can ask about admissions, tuition, deadlines or campus life and get a direct, readable answer.',
  },
  {
    icon: FileText,
    title: 'Every answer is cited',
    text: 'Responses are grounded in your uploaded PDFs and include the document title and exact page number.',
  },
  {
    icon: ShieldCheck,
    title: 'No invented facts',
    text: 'If the uploaded documents do not contain the answer, the chatbot says so instead of guessing.',
  },
];

const statusStyles = {
  checking: { dot: 'bg-accent-400 animate-pulse', label: 'Checking…', text: 'text-accent-500' },
  online: { dot: 'bg-emerald-500', label: 'Connected', text: 'text-emerald-600' },
  offline: { dot: 'bg-rose-500', label: 'Offline', text: 'text-rose-600' },
};

export default function Home() {
  const { status, data, error, check } = useBackendStatus();
  const styles = statusStyles[status];

  const handleCheck = async () => {
    const result = await check();
    toast(
      result === 'online'
        ? 'Backend is reachable'
        : 'Backend is not reachable — is it running on port 5000?',
    );
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="container-page grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="size-3.5" />
              Powered by your university documents
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Instant answers for
              <span className="text-brand-600"> university students</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Ask questions about admissions, fees, courses and deadlines. The
              assistant reads your official PDFs and replies with citations, so
              students can trust every answer.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/chat" size="lg" className="w-full sm:w-auto">
                Start asking
                <ArrowRight className="size-4" />
              </Button>
              <Button
                as={Link}
                to="/admin/login"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <ShieldCheck className="size-4" />
                Admin portal
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <li className="inline-flex items-center gap-2">
                <BookOpenCheck className="size-4 text-brand-600" />
                Answers only from uploaded documents
              </li>
              <li className="inline-flex items-center gap-2">
                <FileText className="size-4 text-brand-600" />
                Page-level citations
              </li>
            </ul>
          </div>

          <Card className="animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  System status
                </h2>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span className={cn('size-2.5 rounded-full', styles.dot)} />
                  <span className={styles.text}>{styles.label}</span>
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCheck}
                disabled={status === 'checking'}
              >
                <RefreshCw
                  className={cn('size-4', status === 'checking' && 'animate-spin')}
                />
                Recheck
              </Button>
            </div>

            <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
              <div>
                <dt className="text-slate-500">API base URL</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-800">
                  {API_BASE_URL}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Environment</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {data?.environment || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Message</dt>
                <dd className="mt-1 text-slate-800">
                  {status === 'online' ? data?.message : error || 'Checking the API…'}
                </dd>
              </div>
            </dl>

            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Start the Express API with{' '}
              <code className="font-mono text-slate-700">npm run dev</code> in the
              Backend folder. This card calls{' '}
              <code className="font-mono text-slate-700">GET /api/health</code>.
            </p>
          </Card>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="h-full">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-2xl bg-brand-900 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to try the assistant?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-100 sm:text-base">
            Ask about admissions, tuition, courses or deadlines. Every reply is
            generated by the university API from the documents your
            administrators upload — with page-level citations.
          </p>
          <Button
            as={Link}
            to="/chat"
            variant="accent"
            size="lg"
            className="mt-6"
          >
            Open the chat
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
