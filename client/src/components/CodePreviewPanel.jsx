import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Share2,
  Code,
  Eye,
  Copy as CopyIcon,
  Check,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const CodePreviewPanel = ({
  isOpen,
  onClose,
  artifact,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedVersion, setSelectedVersion] = useState("latest");
  const [copied, setCopied] = useState(false);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !artifact) return null;

  const currentCodeBlock = artifact.codeBlocks?.[selectedCodeIndex];
  const currentCode = currentCodeBlock?.code || "";
  const currentLanguage = currentCodeBlock?.language || "html";

  const bgPanel = isDark ? "#1a1a1a" : "#ffffff";
  const bgSecondary = isDark ? "#141413" : "#f5f5f7";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";
  const borderColor = isDark ? "border-white/10" : "border-black/10";
  const accentColor = isDark ? "text-orange-400" : "text-orange-600";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    toast.success("Published successfully!");
  };

  const handleExportAsZip = async () => {
    try {
      const zip = new JSZip();
      
      // Add all code blocks to the zip file
      if (artifact.codeBlocks && artifact.codeBlocks.length > 0) {
        artifact.codeBlocks.forEach((block, index) => {
          const fileName = block.fileName || `file_${index + 1}.${getFileExtension(block.language)}`;
          zip.file(fileName, block.code);
        });
      } else {
        // Fallback if no codeBlocks array
        const fileName = `code.${getFileExtension(currentLanguage)}`;
        zip.file(fileName, currentCode);
      }

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      const zipFileName = `${artifact.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.zip`;
      saveAs(content, zipFileName);
      
      toast.success("Code exported as ZIP!");
    } catch (error) {
      console.error("Error exporting ZIP:", error);
      toast.error("Failed to export code as ZIP");
    }
  };

  const getFileExtension = (language) => {
    const extensionMap = {
      html: "html",
      jsx: "jsx",
      css: "css",
      js: "js",
      javascript: "js",
      typescript: "ts",
      python: "py",
      json: "json",
      xml: "xml",
    };
    return extensionMap[language] || "txt";
  };

  const getLanguageMode = (lang) => {
    const langMap = {
      html: "html",
      jsx: "javascript",
      css: "css",
      js: "javascript",
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      json: "json",
      xml: "xml",
    };
    return langMap[lang] || "html";
  };

  return (
    <>
      {/* Custom styles for dropdown */}
      <style>{`
        .version-selector-dropdown option {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .version-selector-dropdown:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .version-selector-dropdown:hover {
          background-color: rgba(0, 0, 0, 0.8) !important;
        }
      `}</style>
      
      {/* Overlay backdrop - click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel from right - overlays on top */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 flex flex-col
          transition-transform duration-300 ease-out
          transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          w-full lg:w-[50%] md:w-[55%] max-w-2xl
          ${isDark ? "bg-[#1a1a1a]" : "bg-white"}
          border-l ${borderColor}
          shadow-2xl
        `}
      >
        {/* Top Bar */}
        <div
          className={`
            flex items-center justify-between px-6 py-4
            border-b ${borderColor}
            flex-shrink-0
          `}
        >
          <div className="flex items-center gap-4 flex-1">
            <h2 className={`text-lg font-semibold truncate ${textPrimary}`}>
              {artifact.title}
            </h2>
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${isDark ? "bg-orange-500/15 text-orange-300" : "bg-orange-100 text-orange-700"}
              `}
            >
              {artifact.version}
            </span>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Version selector */}
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="version-selector-dropdown"
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: '0.5rem',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#000000';
              }}
            >
              <option value="v1" style={{ backgroundColor: '#000000', color: '#ffffff' }}>v1</option>
              <option value="v2" style={{ backgroundColor: '#000000', color: '#ffffff' }}>v2</option>
              <option value="latest" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Latest</option>
            </select>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`
                p-2 rounded-lg transition
                ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              title="Copy code"
            >
              {copied ? (
                <Check size={16} className={accentColor} />
              ) : (
                <CopyIcon size={16} className={textSecondary} />
              )}
            </button>

            {/* Export as ZIP button */}
            <button
              onClick={handleExportAsZip}
              className={`
                p-2 rounded-lg transition
                ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              title="Export as ZIP"
            >
              <Download size={16} className={textSecondary} />
            </button>

            {/* Publish button */}
            <button
              onClick={handlePublish}
              className={`
                p-2 rounded-lg transition
                ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              title="Publish"
            >
              <Share2 size={16} className={textSecondary} />
            </button>

            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`
                p-2 rounded-lg transition
                ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 size={16} className={textSecondary} />
              ) : (
                <Maximize2 size={16} className={textSecondary} />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition ml-2
                ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              title="Close panel"
            >
              <X size={16} className={textSecondary} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`
            flex items-center gap-1 px-6 pt-4 border-b ${borderColor}
            flex-shrink-0
          `}
        >
          {[
            { id: "code", icon: Code, label: "Code" },
            { id: "preview", icon: Eye, label: "Preview" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition
                ${
                  activeTab === tab.id
                    ? `${borderColor.replace("/10", "/30")} ${accentColor}`
                    : `border-transparent ${textSecondary}`
                }
              `}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Code Tab */}
          {activeTab === "code" && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* File selector if multiple code blocks */}
              {artifact.codeBlocks?.length > 1 && (
                <div
                  className={`
                    px-6 py-3 border-b ${borderColor}
                    flex items-center gap-2 overflow-x-auto
                    shrink-0
                  `}
                >
                  {artifact.codeBlocks.map((block, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCodeIndex(idx)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition
                        whitespace-nowrap
                        ${
                          selectedCodeIndex === idx
                            ? `${isDark ? "bg-white/10" : "bg-black/10"} ${textPrimary}`
                            : `${textSecondary} ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`
                        }
                      `}
                    >
                      File {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Monaco Editor */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage={getLanguageMode(currentLanguage)}
                  value={currentCode}
                  theme={isDark ? "vs-dark" : "vs"}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 12,
                    fontFamily: "'Menlo', 'Monaco', monospace",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="flex-1 overflow-hidden p-6">
              <div
                className={`
                  h-full rounded-xl overflow-hidden border ${borderColor}
                  flex items-center justify-center
                `}
                style={{ backgroundColor: bgSecondary }}
              >
                {currentLanguage === "html" ? (
                  <iframe
                    srcDoc={currentCode}
                    className="w-full h-full border-none"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className={`text-center px-6 ${textSecondary}`}>
                    <p className="text-sm">
                      Preview not available for {currentLanguage}
                    </p>
                    <p className="text-xs mt-2">
                      Switch to Code tab to view the source
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && currentLanguage === "html" && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          {/* Header */}
          <div
            className={`
              flex items-center justify-between px-6 py-4
              border-b ${borderColor} shrink-0
              ${isDark ? "bg-[#1a1a1a]" : "bg-white"}
            `}
          >
            <h2 className={`text-lg font-semibold ${textPrimary}`}>
              {artifact.title} - Fullscreen
            </h2>
            <button
              onClick={() => setIsFullscreen(false)}
              className={`
                p-2 rounded-lg transition
                ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
              `}
              title="Exit fullscreen"
            >
              <Minimize2 size={18} className={textSecondary} />
            </button>
          </div>

          {/* Fullscreen Preview */}
          <div className="flex-1 overflow-hidden">
            <iframe
              srcDoc={currentCode}
              className="w-full h-full border-none"
              title="Fullscreen Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CodePreviewPanel;
