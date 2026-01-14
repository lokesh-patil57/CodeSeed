import { useState, useCallback } from "react";
import { toast } from "react-toastify";

// Prefer VITE_API_URL (for deployed backend), then VITE_BACKEND_URL, then localhost
const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";

export const useChatAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.chats || [];
        }
      }
      return [];
    } catch (error) {
      console.error("Error loading chats:", error);
      return [];
    }
  }, []);

  const createNewChat = useCallback(async (title, selectedLanguage) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title || "New Chat",
          selectedLanguage: selectedLanguage || "HTML + CSS",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.chat;
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadChat = useCallback(async (chatId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/${chatId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.chat;
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat");
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (chatId, message, selectedLanguage) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/chat/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message,
          selectedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data;
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send message");
      }
      return null;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChat = useCallback(async (chatId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Chat deleted");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
      return false;
    }
  }, []);

  const updateChatTitle = useCallback(async (chatId, newTitle) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating chat:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }, []);

  return {
    isLoading,
    loadChats,
    createNewChat,
    loadChat,
    sendMessage,
    deleteChat,
    updateChatTitle,
    logout,
  };
};
