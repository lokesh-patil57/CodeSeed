import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function MessageBubble({ message, isDark, onCodeBlockClick }) {
  const isUser = message.role === "user";
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Code copied!");
  };

  const bgUser = isDark ? "bg-orange-500/20 border-orange-500/30" : "bg-orange-100 border-orange-200";
  const bgAI = isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200";
  const textUser = isDark ? "text-orange-200" : "text-orange-900";
  const textAI = isDark ? "text-white/90" : "text-gray-900";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-[85%] rounded-2xl border p-4 ${
          isUser ? bgUser : bgAI
        } ${isUser ? textUser : textAI}`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");
                  const index = Array.from(node.parent?.children || []).indexOf(node) || 0;

                  return !inline && match ? (
                    <div className="relative my-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs opacity-70">{match[1]}</span>
                        <button
                          onClick={() => handleCopy(codeString, index)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10 transition"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check size={14} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={isDark ? vscDarkPlus : vs}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "8px",
                          backgroundColor: isDark ? "#141413" : "#f5f5f7",
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                      {onCodeBlockClick && (
                        <button
                          onClick={() => onCodeBlockClick(codeString, match[1])}
                          className="mt-2 w-full px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-sm font-medium transition"
                        >
                          View in Code Panel
                        </button>
                      )}
                    </div>
                  ) : (
                    <code
                      className={`px-1.5 py-0.5 rounded ${
                        isDark ? "bg-white/10" : "bg-gray-200"
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className={`text-xs mt-2 ${isDark ? "opacity-50" : "opacity-60"}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
