import React, { useEffect, useMemo, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Sun, Moon, ArrowUp, Code, ChevronRight, Sparkles, Menu, X } from "lucide-react";
import { format } from "date-fns";
import { AppContext } from "../context/AppContext";
import MessageBubble from "../components/MessageBubble";
import CodePanel from "../components/CodePanel";
import SettingsModal from "../components/SettingsModal";
import Editor from "@monaco-editor/react";
import EnhancedSidebar from "../components/EnhancedSidebar";
import ChatArea from "../components/ChatArea";
import CodePreviewPanel from "../components/CodePreviewPanel";

const PRIMARY_BG = "#1a1a1a";
const PANEL_BG = "#1a1a1a";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  // Three-pane state
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  
  // Legacy states (keep for backward compatibility)
  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("html-css");
  const [description, setDescription] = useState("");
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [codePanelData, setCodePanelData] = useState(null);

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
          setOutputScreen(false);
          loadChats();
          inputRef.current?.focus();
          return newChat;
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
          setOutputScreen(false);
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
    setIsLoading(true);

    try {
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

  // Code generation function
  async function generateCode() {
    if (!description.trim()) {
      toast.error("Please describe your component");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/chat/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: description,
          framework: getFrameworkLabel(selectedFramework),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedCode(data.code);
          setOutputScreen(true);
          setTab(1);
          toast.success("Code generated successfully!");
        }
      } else {
        const error = await response.json();
        toast.error("Error: " + (error.message || "Failed to generate code"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function getFrameworkLabel(value) {
    const frameworkMap = {
      "html-css": "HTML + CSS",
      "html-tailwind": "HTML + Tailwind CSS",
      "html-bootsrap": "HTML + Bootstrap",
      "html-css-js": "HTML + CSS + JS",
      "html-tailwind-bootsrap": "HTML + Tailwind + Bootstrap",
    };
    return frameworkMap[value] || "HTML + CSS";
  }

  function getLanguageFromFramework(value) {
    const languageMap = {
      "html-css": "html",
      "html-tailwind": "html",
      "html-bootsrap": "html",
      "html-css-js": "javascript",
      "html-tailwind-bootsrap": "html",
    };
    return languageMap[value] || "html";
  }

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

  const handleArtifactClick = (artifact) => {
    setSelectedArtifact(artifact);
    setRightPanelOpen(true);
    setSidebarOpen(false);  // Auto-close sidebar when panel opens
  };

  const handleClosePanel = () => {
    setRightPanelOpen(false);
    setTimeout(() => setSelectedArtifact(null), 300); // Wait for animation
  };

  const createNewChatWithMessage = async (message) => {
    setInputMessage(message);
    const newChat = await createNewChat();
    if (newChat && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDeleteChat = deleteChat;
  const handleUpdateChatTitle = updateChatTitle;

  const textColor = isDark ? "text-white" : "text-gray-900";
  const bgMain = isDark ? PRIMARY_BG : "#f5f5f7";
  const bgPanel = isDark ? PANEL_BG : "#ffffff";
  const toggleTheme = () => setIsDark((prev) => !prev);

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
      className={`flex h-screen transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      } ${textColor} overflow-hidden`}
      style={{ backgroundColor: bgMain }}
    >
      {/* Left Sidebar - Enhanced - Fixed on desktop, overlay on mobile */}
      <EnhancedSidebar
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
