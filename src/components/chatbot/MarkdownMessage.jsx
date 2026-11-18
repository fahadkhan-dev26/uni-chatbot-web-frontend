import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const linkComponent = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer noopener">
    {children}
  </a>
);

export default function MarkdownMessage({ content }) {
  return (
    <div className="markdown-body break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: linkComponent }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
