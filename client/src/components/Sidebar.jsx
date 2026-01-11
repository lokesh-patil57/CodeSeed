import React, { useState } from "react";
import {
  Plus,
  Menu,
  X,
  MessageSquarePlus,
  FolderClosed,
  Box,
  Code,
  Clock,
  Settings,
  LogOut,
  User,
  Edit2,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const Sidebar = ({
  isOpen,
  onToggle,
  isDark,
  userName,
  chats,
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onUpdateChatTitle,
  onSettingsOpen,
  onLogout,
}) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const bgPanel = isDark ? "#1a1a1a" : "#ffffff";
  const bgSecondary = isDark ? "#141413" : "#f5f5f7";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";
  const borderColor = isDark ? "border-white/5" : "border-black/5";
  const accentColor = isDark ? "text-orange-400" : "text-orange-600";

  const handleStartEdit = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (chatId) => {
    if (editingTitle.trim()) {
      onUpdateChatTitle(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const navItems = [
    { icon: MessageSquarePlus, label: "Chats" },
    { icon: FolderClosed, label: "Projects" },
    { icon: Box, label: "Artifacts" },
    { icon: Code, label: "Code" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Full Sidebar - Expanded */}
      <aside
        className={`
          hidden md:flex md:flex-col fixed md:static inset-y-0 left-0 z-30
          h-screen overflow-hidden
          flex-col
          transition-all duration-300 ease-out
          ${isOpen ? "w-72" : "w-20"}
          border-r ${borderColor}
        `}
        style={{ backgroundColor: bgPanel }}
      >
        {/* Header with Collapse Button */}
        <div className="px-3 py-4 border-b flex items-center justify-between" style={{ borderColor: `rgba(255,255,255,${isDark ? 0.05 : 0.05})` }}>
          <div className={`flex items-center gap-2 flex-1 transition-opacity duration-300 ${!isOpen ? "opacity-0 w-0" : "opacity-100"}`}>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isDark ? "bg-orange-500/20" : "bg-orange-100"
              }`}
            >
              <Code size={16} className={accentColor} />
            </div>
            <span className={`font-bold text-sm ${textPrimary}`}>
              CodeSeed
            </span>
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={`
              p-2 rounded-lg transition shrink-0
              ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
            `}
          >
            <ChevronRight size={18} className={`${textSecondary} transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* New Chat Button */}
        {isOpen && (
          <button
            onClick={onNewChat}
            className={`
              mx-3 mt-4 w-auto flex items-center justify-center gap-2
              rounded-xl py-3 px-4 text-sm font-medium transition
              ${
                isDark
                  ? "bg-white/5 hover:bg-white/10 text-white"
                  : "bg-black text-white hover:bg-gray-900"
              }
            `}
          >
            <Plus size={16} />
            New Chat
          </button>
        )}

        {/* Icon-only button when collapsed */}
        {!isOpen && (
          <button
            onClick={onNewChat}
            className={`
              mx-2 mt-3 w-12 h-12 flex items-center justify-center
              rounded-xl transition
              ${
                isDark
                  ? "bg-white/5 hover:bg-white/10 text-white"
                  : "bg-black text-white hover:bg-gray-900"
              }
            `}
            title="New Chat"
          >
            <Plus size={20} />
          </button>
        )}

        {/* Navigation */}
        <nav className={`${isOpen ? "px-3 py-4 space-y-1" : "px-2 py-4 space-y-2 flex flex-col items-center"}`}>
          {navItems.map((item) => (
            isOpen ? (
              <button
                key={item.label}
                className={`
                  w-full flex items-center gap-3 rounded-xl px-3 py-2.5
                  text-sm transition
                  ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}
                  ${textSecondary}
                `}
                title={item.label}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ) : (
              <button
                key={item.label}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-xl
                  transition
                  ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}
                  ${textSecondary}
                `}
                title={item.label}
              >
                <item.icon size={18} />
              </button>
            )
          ))}
        </nav>

        {/* Recents Section */}
        {isOpen && (
          <div className="flex-1 overflow-hidden flex flex-col px-3">
            <div
              className={`
                text-xs uppercase tracking-widest font-medium mb-3 px-1
                ${isDark ? "text-white/40" : "text-gray-500"}
              `}
            >
              Recents
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {chats && chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`
                      group relative rounded-xl px-3 py-2.5 transition
                      cursor-pointer
                      ${
                        currentChatId === chat._id
                          ? isDark
                            ? "bg-orange-500/15 border border-orange-500/30"
                            : "bg-orange-100/50 border border-orange-200"
                          : isDark
                            ? "hover:bg-white/5"
                            : "hover:bg-black/5"
                      }
                    `}
                    onClick={() => onLoadChat(chat._id)}
                  >
                    {editingChatId === chat._id ? (
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(chat._id)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(chat._id);
                          }
                        }}
                        className={`
                          w-full text-sm bg-transparent border-none outline-none
                          ${isDark ? "text-white" : "text-gray-900"}
                        `}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <div className={`text-sm truncate ${textPrimary}`}>
                          {chat.title}
                        </div>
                        <div
                          className={`text-xs mt-1 ${textSecondary}`}
                        >
                          {format(new Date(chat.updatedAt), "MMM d")}
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(chat._id, chat.title);
                            }}
                            className={`
                              p-1.5 rounded-lg transition
                              ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}
                            `}
                            title="Rename chat"
                          >
                            <Edit2 size={12} className={textSecondary} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat._id, e);
                            }}
                            className={`
                              p-1.5 rounded-lg transition
                              hover:bg-red-500/20
                            `}
                            title="Delete chat"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className={`text-xs ${textSecondary} text-center py-4`}>
                  No chats yet. Create one to get started!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {isOpen && (
          <div
            className={`px-3 py-4 border-t space-y-1 shrink-0 ${borderColor}`}
          >
            {/* User Info */}
            <div
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5
                ${isDark ? "bg-white/5" : "bg-black/5"}
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  shrink-0
                  ${isDark ? "bg-white/10" : "bg-black/10"}
                `}
              >
                <User size={14} className={textSecondary} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${textPrimary}`}>
                  {userName}
                </p>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={onSettingsOpen}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-2.5
                text-sm transition
                ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}
                ${textSecondary}
              `}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-2.5
                text-sm transition text-red-400
                ${isDark ? "hover:bg-red-500/10" : "hover:bg-red-100/50"}
              `}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* Collapsed Footer Icons */}
        {!isOpen && (
          <div className={`py-4 space-y-2 flex flex-col items-center shrink-0 border-t ${borderColor}`}>
            <button
              onClick={onSettingsOpen}
              className={`
                flex items-center justify-center w-12 h-12 rounded-xl
                transition
                ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}
                ${textSecondary}
              `}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={onLogout}
              className={`
                flex items-center justify-center w-12 h-12 rounded-xl
                transition text-red-400
                ${isDark ? "hover:bg-red-500/10" : "hover:bg-red-100/50"}
              `}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
