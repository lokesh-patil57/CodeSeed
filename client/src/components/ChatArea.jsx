import React from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ArtifactCard from "./ArtifactCard";

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

  // Transform messages to include artifact cards for code blocks
  const renderMessages = () => {
    return messages.map((msg, idx) => {
      const isUser = msg.role === "user";
      const codeBlocks = msg.codeBlocks || [];

      return (
        <div key={idx} className="space-y-3 mb-6">
          {/* Message bubble */}
          <MessageBubble
            message={msg}
            isDark={isDark}
            isUser={isUser}
          />

          {/* Artifact cards for code blocks */}
          {!isUser && codeBlocks.length > 0 && (
            <div className="space-y-3 pl-0 md:pl-8">
              {codeBlocks.map((block, blockIdx) => (
                <ArtifactCard
                  key={blockIdx}
                  title={block.description || `Component ${blockIdx + 1}`}
                  type="Interactive Artifact"
                  version="v1"
                  codeBlocks={codeBlocks}
                  language={block.language}
                  isDark={isDark}
                  onClick={() => {
                    const artifact = {
                      title: block.description || `Component ${blockIdx + 1}`,
                      type: "Interactive Artifact",
                      version: "v1",
                      codeBlocks: codeBlocks,
                      language: block.language,
                    };
                    onArtifactClick(artifact);
                  }}
                  isSelected={
                    selectedArtifact?.codeBlocks?.[0]?.code === block.code
                  }
                />
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <main
      className={`
        flex-1 flex flex-col relative overflow-hidden
        transition-all duration-300
        ${rightPanelOpen ? "lg:pr-0" : ""}
      `}
    >
      {/* Content area - scales based on right panel */}
      <div
        className={`
          flex-1 overflow-y-auto overflow-x-hidden flex flex-col
          transition-all duration-300 ease-out
        `}
      >
        {/* Welcome Screen or Chat Messages */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-8">
          {showWelcome ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center min-h-full text-center space-y-8 py-12">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Sparkles size={40} color={accentColor} />
                </div>
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-light ${textColor}`}>
                  {greeting}, {userName}
                </h1>
                <p className={`text-base sm:text-lg ${textSecondary}`}>
                  {currentDate}
                </p>
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
            // Chat Messages
            <div className={`
              space-y-6 py-4
              ${rightPanelOpen ? "max-w-2xl" : "max-w-3xl"}
            `}>
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      {!showWelcome && (
        <div
          className={`
            px-4 sm:px-6 md:px-8 pb-6 shrink-0
            border-t
            ${isDark ? "border-white/5" : "border-black/5"}
          `}
        >
          <div className={`
            max-w-3xl mx-auto flex gap-3
          `}>
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Ask me to create something..."
              className={`
                flex-1 px-4 py-3 rounded-lg border resize-none
                focus:outline-none focus:ring-2 focus:ring-orange-400/50
                transition duration-200
                ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/40"
                    : "bg-black/5 border-black/10 text-gray-900 placeholder-gray-500"
                }
              `}
              rows="3"
            />
            <button
              onClick={onSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`
                shrink-0 p-3 rounded-lg transition
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
      )}
    </main>
  );
};

export default ChatArea;
