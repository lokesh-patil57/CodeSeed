import React, { useEffect, useMemo, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Sun, Moon, Menu, X } from "lucide-react";
import { format } from "date-fns";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import CodePreviewPanel from "../components/CodePreviewPanel";
import CodePanel from "../components/CodePanel";
import SettingsModal from "../components/SettingsModal";
import { useChatAPI } from "../hooks/useChatAPI";
import {
  AVAILABLE_LANGUAGES,
  SUGGESTED_PROMPTS,
  PRIMARY_BG,
} from "../constants/chatConfig";
import {
  getGreeting,
  getUserDisplayName,
  extractCodeBlocks,
} from "../utils/chatHelpers";

function Chat() {
  const navigate = useNavigate();
  const { isDark, setIsDark } = useContext(AppContext);
  const {
    isLoading,
    loadChats: apiLoadChats,
    createNewChat: apiCreateNewChat,
    loadChat: apiLoadChat,
    sendMessage: apiSendMessage,
    deleteChat: apiDeleteChat,
    updateChatTitle: apiUpdateChatTitle,
    logout: apiLogout,
  } = useChatAPI();

  // State management
  const [fadeIn, setFadeIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("there");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("HTML + CSS");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [codePanelData, setCodePanelData] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Memoized values
  const greeting = useMemo(() => getGreeting(), []);
  const currentDate = useMemo(
    () => format(new Date(), "EEEE, MMMM d, yyyy"),
    []
  );

  // Initialize user and load chats
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserName(getUserDisplayName(parsedUser));
      setTimeout(() => setFadeIn(true), 150);
      loadChats();
    } catch (error) {
      console.error("Unable to parse stored user:", error);
      navigate("/");
    }
  }, [navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract code blocks from last AI message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        if (lastMessage?.codeBlocks?.length > 0) {
          setCodePanelData({
            codeBlocks: lastMessage.codeBlocks,
            language: selectedLanguage,
          });
        } else {
          const codeBlocks = extractCodeBlocks(lastMessage.content);
          if (codeBlocks.length > 0) {
            setCodePanelData({
              codeBlocks,
              language: selectedLanguage,
            });
          }
        }
      }
    }
  }, [messages, selectedLanguage]);

  // API wrapper functions
  const loadChats = async () => {
    const loadedChats = await apiLoadChats();
    setChats(loadedChats);
  };

  const createNewChat = async () => {
    const newChat = await apiCreateNewChat("New Chat", selectedLanguage);
    if (newChat) {
      setCurrentChat(newChat);
      setMessages([]);
      setShowWelcome(false);
      setCodePanelOpen(false);
      loadChats();
      inputRef.current?.focus();
      return newChat;
    }
    return null;
  };

  const loadChat = async (chatId) => {
    const chat = await apiLoadChat(chatId);
    if (chat) {
      setCurrentChat(chat);
      setMessages(chat.messages || []);
      setSelectedLanguage(chat.selectedLanguage || "HTML + CSS");
      setShowWelcome(false);
      setCodePanelOpen(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    let chatId;
    if (!currentChat) {
      const newChat = await createNewChat();
      if (!newChat) {
        toast.error("Failed to create new chat");
        return;
      }
      chatId = newChat._id;
    } else {
      chatId = currentChat._id;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    const response = await apiSendMessage(
      chatId,
      userMessage.content,
      selectedLanguage
    );

    if (response) {
      setMessages((prev) => [...prev, response.message]);
      if (response.chat?.title && response.chat.title !== currentChat?.title) {
        setCurrentChat((prev) => ({ ...prev, title: response.chat.title }));
        loadChats();
      }
    } else {
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    const success = await apiDeleteChat(chatId);
    if (success) {
      if (currentChat?._id === chatId) {
        setCurrentChat(null);
        setMessages([]);
        setShowWelcome(true);
      }
      loadChats();
    }
  };

  const handleUpdateChatTitle = async (chatId, newTitle) => {
    const success = await apiUpdateChatTitle(chatId, newTitle);
    if (success) {
      loadChats();
      if (currentChat?._id === chatId) {
        setCurrentChat((prev) => ({ ...prev, title: newTitle }));
      }
    }
  };

  const handleLogout = async () => {
    const success = await apiLogout();
    if (success) {
      localStorage.removeItem("user");
      localStorage.removeItem("pendingVerifyEmail");
      navigate("/", { replace: true });
      toast.success("Logged out");
    } else {
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  // Event handlers
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleArtifactClick = (artifact) => {
    setSelectedArtifact(artifact);
    setRightPanelOpen(true);
    setSidebarOpen(false);
  };

  const handleClosePanel = () => {
    setRightPanelOpen(false);
    setTimeout(() => setSelectedArtifact(null), 300);
  };

  const createNewChatWithMessage = async (message) => {
    setInputMessage(message);
    const newChat = await createNewChat();
    if (newChat && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Theme utilities
  const textColor = isDark ? "text-white" : "text-gray-900";
  const bgMain = isDark ? PRIMARY_BG : "#f5f5f7";
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div
      className={`flex h-screen transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      } ${textColor} overflow-hidden`}
      style={{ backgroundColor: bgMain }}
    >
      {/* Left Sidebar - Enhanced - Fixed on desktop, overlay on mobile */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isDark={isDark}
        userName={userName}
        chats={chats}
        currentChatId={currentChat?._id}
        onNewChat={createNewChat}
        onLoadChat={loadChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChatTitle={handleUpdateChatTitle}
        onSettingsOpen={() => setSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Center - Always full width on mobile, flex on desktop */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden h-screen">
        {/* Top Bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", backgroundColor: bgMain }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden p-2 rounded-lg transition ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
              title="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X size={20} className={isDark ? "text-white/70" : "text-gray-600"} />
              ) : (
                <Menu size={20} className={isDark ? "text-white/70" : "text-gray-600"} />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 border font-medium transition-colors ${
                isDark
                  ? "text-white border-white/20 hover:bg-white/10"
                  : "text-black border-gray-300 bg-white hover:bg-gray-50"
              }`}
              style={isDark ? { backgroundColor: "#141413", borderColor: "#333" } : {}}
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang} style={isDark ? { backgroundColor: "#1a1a1a", color: "white" } : { backgroundColor: "white", color: "black" }}>
                  {lang}
                </option>
              ))}
            </select>
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${
                isDark
                  ? "border-white/15 text-white/80 hover:bg-white/10"
                  : "border-black/10 text-gray-800 hover:bg-black/5"
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Chat Area - Main Content */}
        <ChatArea
          currentDate={currentDate}
          greeting={greeting}
          userName={userName}
          showWelcome={showWelcome}
          messages={messages}
          isLoading={isLoading}
          inputMessage={inputMessage}
          selectedLanguage={selectedLanguage}
          isDark={isDark}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          onInputChange={setInputMessage}
          onKeyPress={handleKeyPress}
          onSendMessage={sendMessage}
          onArtifactClick={handleArtifactClick}
          selectedArtifact={selectedArtifact}
          SUGGESTED_PROMPTS={SUGGESTED_PROMPTS}
          rightPanelOpen={rightPanelOpen}
          onCreateNewChat={createNewChatWithMessage}
        />
      </div>

      {/* Right Panel - Code/Preview */}
      <CodePreviewPanel
        isOpen={rightPanelOpen}
        onClose={handleClosePanel}
        artifact={selectedArtifact}
        isDark={isDark}
      />

      {/* Legacy Code Panel - for backward compatibility */}
      <CodePanel
        codeBlocks={codePanelData?.codeBlocks || []}
        language={selectedLanguage}
        isOpen={codePanelOpen}
        onClose={() => setCodePanelOpen(false)}
        isDark={isDark}
        onLanguageChange={setSelectedLanguage}
        availableLanguages={AVAILABLE_LANGUAGES}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
      />
    </div>
  );
}

export default Chat;
