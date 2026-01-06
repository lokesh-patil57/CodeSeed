import { useState, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Maximize2,
  RefreshCw,
  Code,
  Eye,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { toast } from "react-toastify";

const CodePanel = ({
  codeBlocks,
  language,
  isOpen,
  onClose,
  isDark,
  onLanguageChange,
  availableLanguages,
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedCodeBlock, setSelectedCodeBlock] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (codeBlocks && codeBlocks.length > 0) {
      setSelectedCodeBlock(0);
    }
  }, [codeBlocks]);

  if (!isOpen) return null;
  
  // If no code blocks, show empty state
  if (!codeBlocks || codeBlocks.length === 0) {
    return (
      <div
        className={`fixed inset-y-0 right-0 z-40 flex items-center justify-center transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "60%",
          backgroundColor: bgMain,
          borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        }}
      >
        <div className="text-center">
          <Code size={48} className={`mx-auto mb-4 ${textSecondary}`} />
          <p className={textPrimary}>No code blocks available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg border border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentCode = codeBlocks[selectedCodeBlock]?.code || "";
  const currentLanguage = codeBlocks[selectedCodeBlock]?.language || language || "html";

  const bgMain = isDark ? "#1a1a1a" : "#ffffff";
  const bgSecondary = isDark ? "#141413" : "#f5f5f7";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/70" : "text-gray-600";
  const borderColor = isDark ? "border-white/10" : "border-black/10";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    toast.success("Code copied to clipboard!");
  };

  const handleDownload = (format = "single") => {
    if (format === "single") {
      const extension = getFileExtension(currentLanguage);
      const blob = new Blob([currentCode], { type: "text/plain" });
      saveAs(blob, `component.${extension}`);
      toast.success("File downloaded!");
    } else if (format === "zip") {
      const zip = new JSZip();
      codeBlocks.forEach((block, index) => {
        const ext = getFileExtension(block.language || "html");
        zip.file(`component_${index + 1}.${ext}`, block.code);
      });
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "components.zip");
        toast.success("ZIP file downloaded!");
      });
    }
  };

  const getFileExtension = (lang) => {
    const extensions = {
      html: "html",
      css: "css",
      javascript: "js",
      jsx: "jsx",
      tsx: "tsx",
      vue: "vue",
      python: "py",
      json: "json",
    };
    return extensions[lang.toLowerCase()] || "txt";
  };

  const handleExportToCodePen = () => {
    const html = currentCode.includes("<html") ? currentCode : `<html><body>${currentCode}</body></html>`;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://codepen.io/pen/define";
    form.target = "_blank";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify({
      title: "Component",
      html: html,
      css: "",
      js: "",
      editors: "100",
    });

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    toast.success("Opening CodePen...");
  };

  const handleExportToCodeSandbox = () => {
    const html = currentCode.includes("<html") ? currentCode : `<html><body>${currentCode}</body></html>`;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://codesandbox.io/api/v1/sandboxes/define";
    form.target = "_blank";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "parameters";
    input.value = JSON.stringify({
      files: {
        "index.html": { content: html },
        "package.json": {
          content: JSON.stringify({
            name: "component",
            version: "1.0.0",
            main: "index.html",
          }),
        },
      },
    });

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    toast.success("Opening CodeSandbox...");
  };

  const handleRefresh = () => {
    setPreviewKey((prev) => prev + 1);
    toast.success("Preview refreshed!");
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const getPreviewContent = () => {
    if (currentLanguage === "html" || currentCode.includes("<")) {
      return currentCode;
    }
    return `<html><head><style>body { margin: 0; padding: 20px; }</style></head><body>${currentCode}</body></html>`;
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "60%",
          backgroundColor: bgMain,
          borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            backgroundColor: bgSecondary,
          }}
        >
          <div className="flex items-center gap-4">
            {availableLanguages && (
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border ${borderColor} ${textPrimary} bg-transparent text-sm`}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            )}

            {codeBlocks.length > 1 && (
              <div className="flex gap-2">
                {codeBlocks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCodeBlock(index)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      selectedCodeBlock === index
                        ? isDark
                          ? "bg-white/20 text-white"
                          : "bg-black/10 text-gray-900"
                        : `${textSecondary} hover:bg-black/5`
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                onClick={() => {
                  const menu = document.getElementById("export-menu");
                  if (menu) menu.classList.toggle("hidden");
                }}
                className={`p-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-black/5 transition`}
                title="Export"
              >
                <Download size={18} />
              </button>
              <div
                id="export-menu"
                className="hidden absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-50"
                style={{ backgroundColor: bgMain, borderColor }}
              >
                <button
                  onClick={() => {
                    handleDownload("single");
                    document.getElementById("export-menu")?.classList.add("hidden");
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-black/5 ${textPrimary} text-sm`}
                >
                  Download as file
                </button>
                <button
                  onClick={() => {
                    handleDownload("zip");
                    document.getElementById("export-menu")?.classList.add("hidden");
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-black/5 ${textPrimary} text-sm`}
                >
                  Download as ZIP
                </button>
                <button
                  onClick={() => {
                    handleExportToCodePen();
                    document.getElementById("export-menu")?.classList.add("hidden");
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-black/5 ${textPrimary} text-sm flex items-center gap-2`}
                >
                  <ExternalLink size={14} /> Export to CodePen
                </button>
                <button
                  onClick={() => {
                    handleExportToCodeSandbox();
                    document.getElementById("export-menu")?.classList.add("hidden");
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-black/5 ${textPrimary} text-sm flex items-center gap-2`}
                >
                  <ExternalLink size={14} /> Export to CodeSandbox
                </button>
              </div>
            </div>

            <button
              onClick={handleFullscreen}
              className={`p-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-black/5 transition`}
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>

            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-black/5 transition`}
              title="Refresh preview"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-black/5 transition`}
              title="Copy code"
            >
              <Copy size={18} />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-black/5 transition`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-2 px-6 py-2 border-b"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
        >
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "preview"
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/10 text-gray-900"
                : `${textSecondary} hover:bg-black/5`
            }`}
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "code"
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/10 text-gray-900"
                : `${textSecondary} hover:bg-black/5`
            }`}
          >
            <Code size={16} />
            Code
          </button>
          {codeBlocks.length > 1 && (
            <button
              onClick={() => setActiveTab("files")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                activeTab === "files"
                  ? isDark
                    ? "bg-white/10 text-white"
                    : "bg-black/10 text-gray-900"
                  : `${textSecondary} hover:bg-black/5`
              }`}
            >
              <FileText size={16} />
              Files
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "preview" && (
            <div className="h-full">
              <iframe
                key={previewKey}
                title="component-preview"
                srcDoc={getPreviewContent()}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}

          {activeTab === "code" && (
            <div className="h-full overflow-auto">
              <SyntaxHighlighter
                language={currentLanguage}
                style={isDark ? vscDarkPlus : vs}
                customStyle={{
                  margin: 0,
                  padding: "20px",
                  height: "100%",
                  backgroundColor: isDark ? "#141413" : "#ffffff",
                }}
                showLineNumbers
              >
                {currentCode}
              </SyntaxHighlighter>
            </div>
          )}

          {activeTab === "files" && (
            <div className="p-6 space-y-2">
              {codeBlocks.map((block, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCodeBlock(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                    selectedCodeBlock === index
                      ? isDark
                        ? "bg-white/10 border-white/20"
                        : "bg-black/10 border-black/20"
                      : `${borderColor} hover:bg-black/5`
                  }`}
                >
                  <div className={`font-medium ${textPrimary}`}>
                    component_{index + 1}.{getFileExtension(block.language || "html")}
                  </div>
                  <div className={`text-sm mt-1 ${textSecondary}`}>
                    {block.language || "text"} • {block.code.length} characters
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h3 className="text-white font-medium">Component Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <iframe
              key={previewKey}
              title="component-preview-fullscreen"
              srcDoc={getPreviewContent()}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CodePanel;

