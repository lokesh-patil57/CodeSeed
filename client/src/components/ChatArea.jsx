import React from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ArtifactCard from "./ArtifactCard";
import LoadingAnimation from "./LoadingAnimation";

const ChatArea = ({
  currentDate,
  greeting,
  userName,
  showWelcome,
  messages,
  isLoading,
  inputMessage,
  selectedLanguage,
  isDark,
  messagesEndRef,
  inputRef,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onArtifactClick,
  selectedArtifact,
  SUGGESTED_PROMPTS,
  rightPanelOpen,
  onCreateNewChat,
}) => {
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";
  const accentColor = "#f4a261";
  const bgPanel = isDark ? "#141413" : "#f5f5f7";
  const bgMain = isDark ? "#1a1a1a" : "#ffffff";

  // Get artifacts for a specific message index
  const getMessageArtifacts = (msgIdx) => {
    const msg = messages[msgIdx];
    if (!msg || msg.role === "user" || !msg.codeBlocks || msg.codeBlocks.length === 0) {
      return [];
    }

    return msg.codeBlocks.map((block, blockIdx) => {
      const componentName = block.description && block.description.trim() ? 
        block.description : 
        `Component ${blockIdx + 1}`;
      
      return {
        id: `${msgIdx}-${blockIdx}`,
        msgIdx,
        blockIdx,
        title: componentName,
        type: "Interactive Artifact",
        version: blockIdx > 0 ? `v${blockIdx + 1}` : "v1",
        codeBlocks: msg.codeBlocks,
        language: block.language,
        details: block.details || "",
        block,
      };
    });
  };

  // Render messages with their associated artifacts in correct order
  const renderMessagesWithArtifacts = () => {
    return messages.map((msg, idx) => {
      const isUser = msg.role === "user";
      const artifacts = getMessageArtifacts(idx);
      
      return (
        <div key={idx} className="space-y-4">
          {/* 1. User Prompt - Always show first for users */}
          {isUser && <MessageBubble message={msg} isDark={isDark} />}

          {/* 2. Component Cards - Show for AI responses with code blocks */}
          {!isUser && artifacts.length > 0 && (
            <div className="space-y-4 pl-0 md:pl-8">
              {artifacts.map((artifact) => (
                <div key={artifact.id} className="space-y-2">
                  {/* Component Card */}
                  <ArtifactCard
                    title={artifact.title}
                    type={artifact.type}
                    version={artifact.version}
                    codeBlocks={artifact.codeBlocks}
                    language={artifact.language}
                    isDark={isDark}
                    onClick={() => {
                      onArtifactClick(artifact);
                    }}
                    isSelected={selectedArtifact?.id === artifact.id}
                  />
                  
                  {/* Component Details / Description */}
                  {artifact.details && (
                    <div
                      className={`rounded-lg p-3 text-sm border ${
                        isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className={`space-y-1.5 ${isDark ? "text-white/80" : "text-gray-700"}`}>
                        {artifact.details.split("\n").map((line, lineIdx) => {
                          const trimmedLine = line.trim();
                          if (!trimmedLine) return null;
                          
                          // Check if line already starts with a bullet point character
                          const bulletMatch = trimmedLine.match(/^[-•*]\s*(.+)$/);
                          const text = bulletMatch ? bulletMatch[1] : trimmedLine;
                          
                          return (
                            <div key={lineIdx} className="flex items-start gap-2">
                              <span className="text-orange-400 mt-1 font-bold text-xs shrink-0">•</span>
                              <span className="flex-1">{text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 3. AI Description Message - Show after component cards */}
          {!isUser && <MessageBubble message={msg} isDark={isDark} />}

          {/* If AI message with no code blocks, show message normally */}
          {!isUser && artifacts.length === 0 && !showWelcome && (
            <MessageBubble message={msg} isDark={isDark} />
          )}
        </div>
      );
    });
  };

  return (
    <main
      className={`
        flex-1 flex flex-col relative overflow-hidden h-full
        transition-all duration-300
        ${rightPanelOpen ? "lg:pr-[50%] md:pr-[55%]" : ""}
      `}
    >
      {/* Messages area - scrollable only, flex-1 to take remaining space */}
      <div
        className={`
          flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar
          transition-all duration-300 ease-out
        `}
      >
        {/* Welcome Screen or Chat Messages */}
        <div className="px-4 sm:px-6 md:px-8 py-8">
          {showWelcome ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center min-h-full text-center space-y-8 py-12">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Sparkles size={40} color={accentColor} />
                </div>
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl font-light ${textColor}`}
                >
                  {greeting}, {userName}
                </h1>
                {/* <p className={`text-base sm:text-lg ${textSecondary}`}>
                  {currentDate}
                </p> */}
              </div>

              <p className={`text-base sm:text-lg ${textSecondary}`}>
                What would you like to create today?
              </p>

              {/* Suggested Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTED_PROMPTS?.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      onInputChange(prompt);
                      onCreateNewChat(prompt);
                    }}
                    className={`
                      px-4 sm:px-6 py-3 rounded-xl border text-sm sm:text-base text-left transition
                      duration-200 hover:scale-105
                      ${
                        isDark
                          ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                          : "border-black/10 hover:border-black/20 hover:bg-black/5"
                      }
                    `}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages with Artifacts
            <div
              className={`
                space-y-6 py-4 px-4 sm:px-6 md:px-8
                ${rightPanelOpen ? "max-w-2xl" : "max-w-4xl"}
                mx-auto w-full
                transition-all duration-300
              `}
            >
              {renderMessagesWithArtifacts()}
              {isLoading && <LoadingAnimation isDark={isDark} />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div
        className={`
          px-4 sm:px-6 md:px-8 py-4 shrink-0 flex-shrink-0
          transition-all duration-300 w-full
        `}
      >
        <div
          className={`
          w-full flex gap-3 items-end
          transition-all duration-300
          ${rightPanelOpen ? "" : "max-w-4xl mx-auto"}
        `}
        >
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Reply..."
            className={`
              flex-1 px-4 py-2 rounded-xl border resize-none
              focus:outline-none focus:ring-2 focus:ring-orange-400/50
              transition duration-200
              ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                  : "bg-[#f5f5f7] border-black/10 text-gray-900 placeholder-gray-500"
              }
            `}
            rows="3"
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`
                p-3 rounded-lg transition
                flex items-center justify-center
                ${
                  isLoading || !inputMessage.trim()
                    ? isDark
                      ? "bg-white/5 text-white/30"
                      : "bg-black/5 text-gray-400"
                    : isDark
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                }
              `}
              title="Send message"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatArea;
