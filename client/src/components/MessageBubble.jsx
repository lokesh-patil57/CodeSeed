import ReactMarkdown from "react-markdown";
import { useState } from "react";

export default function MessageBubble({ message, isDark, onCodeBlockClick }) {
  const isUser = message.role === "user";

  const bgUser = isDark ? "bg-orange-500/20 border-orange-500/30" : "bg-orange-100 border-orange-200";
  const bgAI = isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200";
  const textUser = isDark ? "text-orange-200" : "text-orange-900";
  const textAI = isDark ? "text-white/90" : "text-gray-900";

  // Extract only text content, removing code blocks
  const getTextContent = (content) => {
    if (!content) return "";
    // Remove code blocks (```...```) from the content
    return content.replace(/```[\s\S]*?```/g, "").trim();
  };

  const textContent = getTextContent(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl border p-4 ${
          isUser ? bgUser : bgAI
        } ${isUser ? textUser : textAI}`}
      >
        {isUser ? (
          // User message - show as is
          <div className="whitespace-pre-wrap break-words overflow-wrap-break-word text-sm">
            {message.content}
          </div>
        ) : (
          // AI message - show only text in readable format
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                // Remove code block rendering
                code({ node, inline, className, children, ...props }) {
                  if (inline) {
                    // Keep inline code but don't show as code block
                    return null;
                  }
                  // Don't render code blocks
                  return null;
                },
                // Format paragraphs
                p: ({ children }) => {
                  // Convert bullet points from markdown text
                  const text = String(children);
                  if (text.includes("•") || text.match(/^\d+\./)) {
                    return <p className="mb-2 text-sm">{children}</p>;
                  }
                  return <p className="mb-2 text-sm leading-relaxed">{children}</p>;
                },
                // Format unordered lists with better styling
                ul: ({ children }) => (
                  <ul className="list-none mb-3 space-y-2 pl-0">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-sm flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5 font-bold">•</span>
                    <span>{children}</span>
                  </li>
                ),
                // Format ordered lists
                ol: ({ children }) => (
                  <ol className="list-none mb-3 space-y-2 pl-0 counter-reset-list">
                    {children}
                  </ol>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mb-3 text-orange-300">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mb-2 text-orange-300">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold mb-2 text-orange-300">{children}</h3>
                ),
              }}
            >
              {textContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
