import { useEffect, useMemo, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowUp,
  Box,
  Code,
  Clock,
  FolderClosed,
  MessageSquarePlus,
  PanelsTopLeft,
  Plus,
  Sparkles,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Trash2,
  Edit2,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import { AppContext } from "../context/AppContext";
import MessageBubble from "../components/MessageBubble";
import CodePanel from "../components/CodePanel";
import SettingsModal from "../components/SettingsModal";

const PRIMARY_BG = "#050505";
const PANEL_BG = "#0c0d0f";
const ACCENT = "#f4a261";

const AVAILABLE_LANGUAGES = [
  "HTML + CSS",
  "HTML + Tailwind CSS",
  "HTML + Bootstrap",
  "HTML + CSS + JS",
  "HTML + Tailwind + Bootstrap",
  "React + Tailwind",
  "Vue + Tailwind",
  "Angular + Bootstrap",
  "Next.js + Tailwind",
];

const SUGGESTED_PROMPTS = [
  "Create a login form",
  "Build a pricing card",
  "Design a navigation bar",
  "Make a button component",
  "Create a modal dialog",
];

function Chat() {
  const navigate = useNavigate();
  const { isDark, setIsDark } = useContext(AppContext);
  const [fadeIn, setFadeIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("there");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("HTML + CSS");
  const [isLoading, setIsLoading] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [codePanelData, setCodePanelData] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const currentDate = useMemo(() => {
    return format(new Date(), "EEEE, MMMM d, yyyy");
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const fallbackName =
        parsedUser?.username ||
        parsedUser?.email?.split("@")[0] ||
        "friend";
      setUserName(fallbackName);
      setTimeout(() => setFadeIn(true), 150);
      loadChats();
    } catch (error) {
      console.error("Unable to parse stored user:", error);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChats(data.chats || []);
        }
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "New Chat",
          selectedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newChat = data.chat;
          setCurrentChat(newChat);
          setMessages([]);
          setShowWelcome(false);
          setCodePanelOpen(false);
          loadChats();
          inputRef.current?.focus();
        }
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/${chatId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentChat(data.chat);
          setMessages(data.chat.messages || []);
          setSelectedLanguage(data.chat.selectedLanguage || "HTML + CSS");
          setShowWelcome(false);
          setCodePanelOpen(false);
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    // If no current chat, create one
    if (!currentChat) {
      await createNewChat();
      // Wait a bit for chat to be created
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const chatId = currentChat?._id;
      if (!chatId) {
        toast.error("Chat not initialized");
        return;
      }

      const response = await fetch(`${backendUrl}/api/chat/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage.content,
          selectedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages((prev) => [...prev, data.message]);
          if (data.chat?.title && data.chat.title !== currentChat?.title) {
            setCurrentChat((prev) => ({ ...prev, title: data.chat.title }));
            loadChats();
          }
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeBlockClick = (code, language) => {
    setCodePanelData({
      codeBlocks: [{ code, language }],
      language: selectedLanguage,
    });
    setCodePanelOpen(true);
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      const response = await fetch(`${backendUrl}/api/chat/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
          setMessages([]);
          setShowWelcome(true);
        }
        loadChats();
        toast.success("Chat deleted");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const updateChatTitle = async (chatId, newTitle) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        loadChats();
        if (currentChat?._id === chatId) {
          setCurrentChat((prev) => ({ ...prev, title: newTitle }));
        }
      }
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        localStorage.removeItem("user");
        localStorage.removeItem("pendingVerifyEmail");
        navigate("/", { replace: true });
        toast.success("Logged out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const textColor = isDark ? "text-white" : "text-gray-900";
  const bgMain = isDark ? PRIMARY_BG : "#f5f5f7";
  const bgPanel = isDark ? PANEL_BG : "#ffffff";
  const toggleTheme = () => setIsDark((prev) => !prev);

  // Extract code blocks from messages for code panel
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        // Check if message has codeBlocks property
        if (lastMessage?.codeBlocks?.length > 0) {
          setCodePanelData({
            codeBlocks: lastMessage.codeBlocks,
            language: selectedLanguage,
          });
        } else {
          // Extract code blocks from markdown content
          const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
          const codeBlocks = [];
          let match;
          while ((match = codeBlockRegex.exec(lastMessage.content)) !== null) {
            codeBlocks.push({
              language: match[1] || "text",
              code: match[2].trim(),
              description: "",
            });
          }
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

  return (
    <div
      className={`flex min-h-screen transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      } ${textColor}`}
      style={{ backgroundColor: bgMain }}
    >
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 flex flex-col justify-between w-72 px-4 py-6 border-r transition-transform duration-300 ${
          isDark ? "border-white/5" : "border-black/5"
        }`}
        style={{ backgroundColor: bgPanel }}
      >
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Logo and toggle */}
          <div className="flex items-center justify-between mb-6">
            <button
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-opacity-70 transition-colors ${
                isDark
                  ? "border-white/10 text-white/80"
                  : "border-black/10 text-gray-800"
              }`}
            >
              <PanelsTopLeft size={16} /> CodeSeed
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition mb-6 ${
              isDark ? "bg-white/5 hover:bg-white/10" : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            <Plus size={16} /> New chat
          </button>

          {/* Navigation */}
          <nav
            className={`space-y-2 text-sm mb-6 ${
              isDark ? "text-white/70" : "text-gray-700"
            }`}
          >
            {[
              { icon: MessageSquarePlus, label: "Chats" },
              { icon: FolderClosed, label: "Projects" },
              { icon: Box, label: "Artifacts" },
              { icon: Code, label: "Code" },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 ${
                  isDark ? "hover:bg-white/5" : ""
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Recent Chats */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="text-xs uppercase tracking-widest text-white/50 mb-4">Recents</div>
            <div
              className={`flex-1 overflow-y-auto space-y-1 pr-1 text-sm custom-scroll ${
                isDark ? "text-white/70" : "text-gray-700"
              }`}
            >
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`group relative rounded-xl px-3 py-2 cursor-pointer transition ${
                    currentChat?._id === chat._id
                      ? isDark
                        ? "bg-white/10"
                        : "bg-black/10"
                      : "hover:bg-white/5"
                  }`}
                  onClick={() => loadChat(chat._id)}
                >
                  {editingChatId === chat._id ? (
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        if (editingTitle.trim()) {
                          updateChatTitle(chat._id, editingTitle.trim());
                        }
                        setEditingChatId(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          if (editingTitle.trim()) {
                            updateChatTitle(chat._id, editingTitle.trim());
                          }
                          setEditingChatId(null);
                        }
                      }}
                      className="w-full bg-transparent border-none outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="truncate">{chat.title}</div>
                      <div className="text-xs opacity-50 mt-1">
                        {format(new Date(chat.updatedAt), "MMM d")}
                      </div>
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat._id);
                            setEditingTitle(chat.title);
                          }}
                          className="p-1 rounded hover:bg-white/10"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => deleteChat(chat._id, e)}
                          className="p-1 rounded hover:bg-red-500/20"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div
          className={`space-y-3 text-sm border-t pt-4 ${
            isDark ? "border-white/10" : "border-black/10"
          }`}
        >
          <div
            className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
              isDark ? "bg-white/5" : "bg-black/5"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isDark ? "bg-white/10" : "bg-black/10"
              }`}
            >
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 text-left"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 text-left text-red-400"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <main className="flex-1 flex flex-col relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5"
            >
              <Menu size={20} />
            </button>
            
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`rounded-full bg-transparent px-3 py-1 text-sm focus:outline-none border ${
                isDark
                  ? "text-white/70 border-white/10"
                  : "text-gray-800 border-black/10"
              }`}
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center rounded-full border px-2.5 py-1.5 text-xs transition-colors ${
                isDark
                  ? "border-white/15 text-white/80 hover:bg-white/10"
                  : "border-black/10 text-gray-800 hover:bg-black/5"
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {showWelcome && !currentChat ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-8">
                <Sparkles size={32} color={ACCENT} className="mx-auto mb-4" />
                <h1 className={`text-4xl md:text-6xl font-light mb-2 ${textColor}`}>
                  {greeting}, {userName}
                </h1>
                <p className={`text-lg ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  {currentDate}
                </p>
              </div>
              <p className={`text-base mb-8 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                How can I help you today?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInputMessage(prompt);
                      createNewChat();
                    }}
                    className={`px-6 py-3 rounded-xl border text-left transition ${
                      isDark
                        ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                        : "border-black/10 hover:border-black/20 hover:bg-black/5"
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  isDark={isDark}
                  onCodeBlockClick={handleCodeBlockClick}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-white/60 mb-6">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>Generating code...</span>
                </div>
              )}
              {codePanelData && codePanelData.codeBlocks.length > 0 && !codePanelOpen && (
                <div className="max-w-4xl mx-auto mb-6">
                  <button
                    onClick={() => setCodePanelOpen(true)}
                    className="w-full px-6 py-4 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <Code size={20} />
                      <div className="text-left">
                        <div className="font-medium">View Generated Code</div>
                        <div className="text-sm opacity-70">
                          {codePanelData.codeBlocks.length} code block{codePanelData.codeBlocks.length > 1 ? "s" : ""} available
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <div className="max-w-4xl mx-auto">
            <div
              className={`w-full rounded-3xl border p-4 text-left shadow-[0_10px_60px_rgba(0,0,0,0.4)] backdrop-blur bg-gradient-to-b ${
                isDark
                  ? "from-white/5 to-transparent border-white/10"
                  : "from-white to-gray-100 border-black/10"
              }`}
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="How can I help you today?"
                  rows={1}
                  disabled={isLoading}
                  className={`flex-1 resize-none bg-transparent text-lg focus:outline-none ${
                    isDark
                      ? "text-white placeholder-white/30"
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                  style={{ minHeight: "24px", maxHeight: "200px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`flex items-center justify-center rounded-full p-3 transition ${
                    inputMessage.trim() && !isLoading
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
              <div
                className={`mt-3 flex items-center justify-between text-xs ${
                  isDark ? "text-white/40" : "text-gray-500"
                }`}
              >
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-white/5">{selectedLanguage}</span>
                </div>
                <p className="text-xs">CodeSeed may make mistakes. Please verify important information.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Code Panel */}
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
