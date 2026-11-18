# University AI Chatbot — Frontend

React (JavaScript) frontend for the University AI Chatbot. Built with Vite,
Tailwind CSS v4, React Router, Axios and React Hot Toast. It talks to the
Express API in `../Backend`.

## Requirements

- Node.js 20.19+ (or 22.12+)
- The backend running at `http://localhost:5000`

## Setup

```bash
npm install
cp .env.example .env   # already created for local development
npm run dev
```

The dev server runs at http://localhost:5173, which must match `CLIENT_URL` in
the backend `.env` for CORS.

## Environment

Only variables prefixed with `VITE_` reach the browser. Never put secrets here —
the frontend holds only the public API URL and receives a JWT at sign-in.

| Variable | Purpose | Local | Production |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Express API base URL, including `/api` | `http://localhost:5000/api` | `https://<backend-host>/api` |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Routes

| Path | Page |
| --- | --- |
| `/` | Student landing page with API status |
| `/chat` | Student chat (full-screen, own sidebar navigation) |
| `/admin/login` | Admin sign-in (JWT) |
| `/admin` | Protected admin overview |
| `/admin/documents` | Document library (search, filter, reprocess, replace, delete) |
| `/admin/documents/upload` | PDF upload with per-file metadata |
| `/admin/categories` | Category distribution |
| `/admin/settings` | Account, API/database status, access rules |
| `*` | Not-found page |

`vercel.json` rewrites every path to `index.html` so these client-side routes
survive a hard refresh.

## Structure

```
src/
  assets/           Static assets imported by components
  components/
    common/         Reusable UI (Button, Card, Spinner, ProtectedRoute)
    layout/         Navbar, Footer
    chatbot/        Chat sidebar, header, welcome, messages, composer, citations
    admin/          Admin tables, dialogs, dropzone, charts, badges
  pages/
    student/        Home, Chat
    admin/          Login, Overview, Documents, UploadDocuments, Categories, Settings
  layouts/          PublicLayout, AdminLayout
  services/         Axios instance + API modules (auth, chat, documents, health, system)
  hooks/            useAuth, useBackendStatus, useChat, useDocumentLibrary
  context/          AuthProvider and auth context
  utils/            storage, chatStorage, format, documentStats, branding, cn()
  App.jsx           Route definitions (admin + chat are code-split)
  main.jsx          App bootstrap (Router, AuthProvider, Toaster)
  index.css         Tailwind import, design tokens, markdown styles
```

## Data flow and security boundaries

- The browser never connects to MongoDB. Every read and write goes through the
  Express API.
- Student chat is anonymous by default: the browser keeps an opaque `sessionId`
  and a capped index of conversation metadata in `localStorage`; message content
  is always fetched from the API.
- Admin document operations (upload, reprocess, replace, delete) require an
  admin JWT. The Axios request interceptor attaches it, and the backend enforces
  `authenticate` + `authorize('admin')` on every route.
- A 401 from the API clears the stored token and returns the admin to sign-in.
- Answers and citations are produced by the backend RAG pipeline; the frontend
  never fabricates a response.

## Chat attachments

The composer can send up to 3 files (10 MB each) per question with the paperclip
button: PDF, TXT, MD, CSV, JSON, PNG, JPG or WEBP. The request becomes
`multipart/form-data` to `POST /api/chat/message` (`attachments` field).

- PDFs and text files are extracted on the backend and used as per-message
  context with page-level citations. Nothing is added to the document corpus and
  file contents are never persisted — only the name, type and size appear in the
  conversation history.
- Images require a multi-modal Ollama model. Set `OLLAMA_VISION_MODEL` (for
  example `llava`) on the backend; without it, images are accepted but skipped
  with an explanatory notice in the answer.
- Limits are configurable on the backend with `CHAT_ATTACHMENT_MAX_MB` and
  `CHAT_ATTACHMENT_MAX_FILES`.

## Deploy to Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Set **Root Directory** to `Frontend`. Vercel detects Vite automatically
   (build `npm run build`, output `dist`).
3. Add the production environment variable:

   | Name | Value | Environment |
   | --- | --- | --- |
   | `VITE_API_BASE_URL` | `https://<your-api-domain>/api` | Production (and Preview if you test previews) |

   The value is baked in at build time, so redeploy after changing it.
4. Deploy, then copy the resulting domain (for example
   `https://university-ai-chatbot.vercel.app`).
5. On the backend host, set `CLIENT_URL` to that exact origin (no trailing
   slash) and redeploy. The Express CORS config accepts a single origin, so
   preview deployments need `CLIENT_URL` updated or a preview URL added
   explicitly.
6. Confirm `https://<backend-host>/api/health` responds, then open
   `/admin/login` and sign in with the seeded administrator.

Vercel installs `devDependencies` during the build, so Tailwind and Vite are
available without extra configuration.
