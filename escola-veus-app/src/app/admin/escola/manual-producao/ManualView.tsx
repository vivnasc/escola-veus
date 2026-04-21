"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ManualView({ content }: { content: string }) {
  const printPage = () => window.print();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Manual de Produção
        </h2>
        <button
          onClick={printPage}
          className="rounded bg-escola-coral px-4 py-2 text-xs font-semibold text-white"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <article className="prose-escola rounded-xl border border-escola-border bg-escola-card p-6 print:border-0 print:bg-white print:p-0 print:text-black">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>

      <style jsx global>{`
        .prose-escola h1 {
          font-family: var(--font-serif, serif);
          font-size: 1.8rem;
          color: var(--color-escola-dourado, #d4a853);
          margin: 0 0 1rem;
        }
        .prose-escola h2 {
          font-family: var(--font-serif, serif);
          font-size: 1.35rem;
          color: var(--color-escola-creme, #f5f0e6);
          margin: 2rem 0 0.75rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(245, 240, 230, 0.15);
        }
        .prose-escola h3 {
          font-size: 1.05rem;
          color: var(--color-escola-creme, #f5f0e6);
          margin: 1.5rem 0 0.5rem;
        }
        .prose-escola p,
        .prose-escola li {
          font-size: 0.88rem;
          line-height: 1.6;
          color: rgba(245, 240, 230, 0.85);
        }
        .prose-escola ul,
        .prose-escola ol {
          margin: 0.5rem 0 1rem 1.3rem;
        }
        .prose-escola ul { list-style: disc; }
        .prose-escola ol { list-style: decimal; }
        .prose-escola li { margin: 0.25rem 0; }
        .prose-escola blockquote {
          border-left: 3px solid rgba(212, 168, 83, 0.5);
          padding: 0.1rem 0.8rem;
          margin: 1rem 0;
          color: rgba(245, 240, 230, 0.7);
          font-style: italic;
        }
        .prose-escola code {
          background: rgba(245, 240, 230, 0.08);
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          font-size: 0.8em;
          font-family: ui-monospace, monospace;
          color: #e8c974;
        }
        .prose-escola pre {
          background: #0d0d0d;
          border: 1px solid rgba(245, 240, 230, 0.1);
          border-radius: 6px;
          padding: 0.8rem 1rem;
          overflow-x: auto;
          margin: 0.8rem 0 1.2rem;
        }
        .prose-escola pre code {
          background: transparent;
          padding: 0;
          color: rgba(245, 240, 230, 0.85);
          font-size: 0.78rem;
          line-height: 1.4;
        }
        .prose-escola table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.8rem 0 1.2rem;
          font-size: 0.82rem;
        }
        .prose-escola th,
        .prose-escola td {
          border: 1px solid rgba(245, 240, 230, 0.12);
          padding: 0.4rem 0.6rem;
          text-align: left;
          color: rgba(245, 240, 230, 0.85);
        }
        .prose-escola th {
          background: rgba(245, 240, 230, 0.05);
          color: var(--color-escola-dourado, #d4a853);
          font-weight: 600;
        }
        .prose-escola a {
          color: var(--color-escola-dourado, #d4a853);
          text-decoration: underline;
        }
        .prose-escola strong { color: var(--color-escola-creme, #f5f0e6); }
        .prose-escola hr {
          border: 0;
          border-top: 1px solid rgba(245, 240, 230, 0.1);
          margin: 2rem 0;
        }
        @media print {
          .prose-escola,
          .prose-escola * {
            color: #000 !important;
            background: #fff !important;
          }
          .prose-escola h1 { color: #8a6915 !important; }
          .prose-escola th { color: #8a6915 !important; }
          .prose-escola code { color: #6b4200 !important; }
          .prose-escola a { color: #6b4200 !important; }
          .prose-escola pre {
            border: 1px solid #ccc !important;
            background: #f5f5f5 !important;
          }
        }
      `}</style>
    </div>
  );
}
