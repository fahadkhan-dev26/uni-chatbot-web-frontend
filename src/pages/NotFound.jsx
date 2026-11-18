import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass className="size-7" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist or was moved.
        </p>
        <Button as={Link} to="/" className="mt-6">
          Back to home
        </Button>
      </div>
    </div>
  );
}
