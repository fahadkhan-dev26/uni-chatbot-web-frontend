import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          &copy; {currentYear} University AI Chatbot. Answers are generated from
          official university documents.
        </p>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/" className="link-muted">
            Home
          </Link>
          <Link to="/chat" className="link-muted">
            Chat
          </Link>
          <Link to="/admin/login" className="link-muted">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
