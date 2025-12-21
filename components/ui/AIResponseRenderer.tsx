import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResponseRendererProps {
  content: string;
  className?: string;
}

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AIResponseRenderer: React.FC<AIResponseRendererProps> = ({
  content,
  className = ""
}) => {
  return (
    <div className={`ai-response-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: (props) => (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-foreground mb-6 mt-8 first:mt-0" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-3xl font-bold text-foreground mb-4 mt-6 first:mt-0 border-b-2 border-gray-200 pb-2" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-2xl font-semibold text-foreground mb-3 mt-5 first:mt-0" {...props} />
          ),
          h4: (props) => (
            <h4 className="text-xl font-semibold text-foreground mb-3 mt-4 first:mt-0" {...props} />
          ),

          // Paragraphs
          p: (props) => (
            <p className="text-foreground mb-4 leading-relaxed" {...props} />
          ),

          // Tables
          table: (props) => (
            <div className="overflow-x-auto my-6 rounded-xl shadow-lg border border-border backdrop-blur-sm">
              <table className="min-w-full border-collapse bg-card" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-muted text-foreground" {...props} />
          ),
          th: (props) => (
            <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider border-b border-border" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-border" {...props} />
          ),
          tr: (props) => (
            <tr className="hover:bg-accent/50 transition-colors duration-200" {...props} />
          ),
          td: (props) => (
            <td className="px-6 py-4 text-sm text-foreground border-b border-border last:border-b-0" {...props} />
          ),

          // Lists
          ul: (props) => (
            <ul className="list-none mb-6 space-y-2 text-foreground" {...props} />
          ),
          ol: (props) => (
            <ol className="list-none mb-6 space-y-2 text-foreground counter-reset-list" {...props} />
          ),
          li: ({ ordered, ...props }) =>
            ordered ? (
              <li className="flex items-start space-x-3 counter-increment-list">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold counter-display"></span>
                <span className="flex-1 pt-0.5" {...props} />
              </li>
            ) : (
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="flex-1" {...props} />
              </li>
            ),

          // Code
          code(props: any) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code className="bg-muted text-foreground px-2 py-1 rounded-md text-sm font-mono font-semibold" {...rest}>
                  {children}
                </code>
              );
            }

            const codeString = String(children).replace(/\n$/, "");

            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
            };

            return (
              <div className="relative rounded-xl overflow-hidden my-4 shadow-lg border border-border">
                {/* Header with language label and copy button */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/80 backdrop-blur border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-2">
                      {match ? match[1] : "Code"}
                    </span>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background border border-border/50 hover:border-border rounded-md transition-all duration-200"
                    title="Copy code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Copy
                  </button>
                </div>

                {/* Code content */}
                <SyntaxHighlighter
                  {...rest}
                  PreTag="div"
                  children={codeString}
                  language={match ? match[1] : "text"}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    background: "rgb(18, 18, 18)", // Darker background for contrast
                    fontSize: "0.875rem",
                    lineHeight: "1.6",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: "var(--font-mono)",
                    },
                  }}
                />
              </div>
            );
          },

          pre: ({ node, ...props }) => (
            // The 'code' component handles the block rendering with SyntaxHighlighter.
            // We strip the 'ref' to avoid type mismatch (HTMLPreElement vs HTMLDivElement)
            // and use a div to avoid invalid HTML (div inside pre).
            <div {...(props as any)} className="not-prose" />
          ),

          // Blockquotes
          blockquote: (props) => (
            <blockquote className="border-l-4 border-blue-500 bg-transparent pl-6 pr-4 my-6 italic text-foreground rounded-r-lg shadow-sm" {...props} />
          ),

          // Links
          a: (props) => (
            <a className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all duration-200 font-medium" {...props} />
          ),

          // Horizontal rule
          hr: (props) => (
            <hr className="border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" {...props} />
          ),

          // Strong/Bold
          strong: (props) => (
            <strong className="font-bold text-foreground" {...props} />
          ),

          // Emphasis/Italic
          em: (props) => (
            <em className="italic text-foreground/80" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default AIResponseRenderer;