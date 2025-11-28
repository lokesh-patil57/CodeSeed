import { useState } from "react";

export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(()=>setCopied(false), 1500);
    alert("Code copied!");
  };

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={copy} className="bg-neutral-800 px-3 py-1 rounded">{copied ? "Copied!" : "Copy"}</button>
      </div>
      <pre className="bg-neutral-900 p-4 rounded mt-2 overflow-auto"><code>{code}</code></pre>
      {/* simple preview for HTML/JS (iframe) */}
      <div className="mt-3">
        <iframe title="preview" className="w-full h-48 rounded border" srcDoc={code} />
      </div>
    </div>
  );
}
