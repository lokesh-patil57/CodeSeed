import { useEffect, useMemo, useState, useContext } from "react";
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
} from "lucide-react";
import { AppContext } from "../context/AppContext";

const RECENTS = [
  "React login box component",
  "OTP login component redesign",
  "Sticky navbar with Claude-style glassmorphism",
  "Starting a conversation",
  "Responsive notes app with local storage",
  "React UI page design",
  "Personal blog platform with MERN",
  "React Home Page with Navigation",
  "Google Web Dev Resume Strategy",
  "NGO Website Blog Design",
];

const PRIMARY_BG = "#050505";
const PANEL_BG = "#0c0d0f";
const ACCENT = "#f4a261";

function Chat() {
  const navigate = useNavigate();
  const { isDark } = useContext(AppContext);
  const [fadeIn, setFadeIn] = useState(false);
  const [userName, setUserName] = useState("there");
  const [loggingOut, setLoggingOut] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const fallbackName =
        parsedUser?.username ||
        parsedUser?.email?.split("@")[0] ||
        "friend";
      setUserName(fallbackName);
      setTimeout(() => setFadeIn(true), 150);
    } catch (error) {
      console.error("Unable to parse stored user:", error);
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    let shouldNavigate = false;
    try {
      const res = await fetch(`${backendUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to log out.");
      }
      toast.success("Logged out");
      shouldNavigate = true;
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message || "Could not log out. Clearing local data.");
      shouldNavigate = true;
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("pendingVerifyEmail");
      if (shouldNavigate) {
        navigate("/", { replace: true });
      }
      setLoggingOut(false);
    }
  };

  const textColor = isDark ? "text-white" : "text-gray-900";
  const bgMain = isDark ? PRIMARY_BG : "#f5f5f7";
  const bgPanel = isDark ? PANEL_BG : "#ffffff";

  return (
    <div
      className={`flex min-h-screen transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      } ${textColor}`}
      style={{ backgroundColor: bgMain }}
    >
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between px-4 py-6 w-72 border-r ${
          isDark ? "border-white/5" : "border-black/5"
        }`}
        style={{ backgroundColor: bgPanel }}
      >
        <div>
          <button
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-opacity-70 transition-colors ${
              isDark
                ? "border-white/10 text-white/80"
                : "border-black/10 text-gray-800"
            }`}
          >
            <PanelsTopLeft size={16} /> Claude
          </button>

          <button
            className={`mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition ${
              isDark ? "bg-white/5 hover:bg-white/10" : "bg-black text-white"
            }`}
          >
            <Plus size={16} /> New chat
          </button>

          <nav
            className={`mt-6 space-y-2 text-sm ${
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

          <div className="mt-8 text-xs uppercase tracking-widest text-white/50">
            Recents
          </div>

          <div
            className={`mt-4 space-y-2 overflow-y-auto pr-1 text-sm max-h-[48vh] custom-scroll ${
              isDark ? "text-white/70" : "text-gray-700"
            }`}
          >
            {RECENTS.map((label) => (
              <button
                key={label}
                className="w-full truncate text-left rounded-xl px-3 py-2 hover:bg-white/5"
                title={label}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`space-y-3 text-sm ${
            isDark ? "text-white/70" : "text-gray-700"
          }`}
        >
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5">
            <Clock size={16} />
            Activity
          </button>
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
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-white/60">Free plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-2xl border border-white/15 px-3 py-2 text-left text-white/80 hover:bg-white/5 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 px-6 py-8 md:px-16">
        <div className="flex flex-col h-full mx-auto max-w-4xl">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                isDark ? "bg-white/5" : "bg-black/5 text-white"
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest">
                Free plan
              </span>
              <span className="text-white/50">·</span>
              <button className="text-white hover:text-white/80">Upgrade</button>
            </div>
            <select
              className={`rounded-full bg-transparent px-3 py-1 text-sm focus:outline-none border ${
                isDark
                  ? "text-white/70 border-white/10"
                  : "text-gray-800 border-black/10"
              }`}
            >
              <option className={isDark ? "bg-black" : "bg-white"}>
                Sonnet 4.5
              </option>
              <option className={isDark ? "bg-black" : "bg-white"}>
                Haiku 3.5
              </option>
            </select>
          </div>

          <section className="mt-20 text-center">
            <div
              className={`flex items-center justify-center gap-2 text-lg ${
                isDark ? "text-white/70" : "text-gray-700"
              }`}
            >
              <Sparkles size={18} color={ACCENT} />
              <span
                className={`text-3xl md:text-5xl font-light ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {greeting}, {userName}
              </span>
            </div>
            <p
              className={`mt-3 text-base ${
                isDark ? "text-white/60" : "text-gray-600"
              }`}
            >
              How can I help you today?
            </p>
          </section>

          <div className="mt-12 flex justify-center">
            <div
              className={`w-full rounded-3xl border p-6 text-left shadow-[0_10px_60px_rgba(0,0,0,0.4)] backdrop-blur bg-gradient-to-b ${
                isDark
                  ? "from-white/5 to-transparent border-white/10"
                  : "from-white to-gray-100 border-black/10"
              }`}
            >
              <div className="flex items-center">
                <textarea
                  placeholder="How can I help you today?"
                  rows={1}
                  className={`flex-1 resize-none bg-transparent text-lg focus:outline-none ${
                    isDark
                      ? "text-white placeholder-white/30"
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
                <div className="flex gap-2">
                  <button className="rounded-full border border-white/10 p-2 hover:border-white/40">
                    <Plus size={18} />
                  </button>
                  <button className="rounded-full border border-white/10 p-2 hover:border-white/40">
                    <MessageSquarePlus size={18} />
                  </button>
                  <button className="rounded-full border border-white/10 p-2 hover:border-white/40">
                    <Code size={18} />
                  </button>
                </div>
              </div>

              <div
                className={`mt-4 flex items-center justify-between text-xs ${
                  isDark ? "text-white/40" : "text-gray-500"
                }`}
              >
                <div className="flex gap-2">
                  {["+", "⋮", "⏱"].map((icon) => (
                    <span
                      key={icon}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10"
                    >
                      {icon}
                    </span>
                  ))}
                </div>
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 transition">
                  Send
                  <ArrowUp size={14} />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 text-center text-xs ${
              isDark ? "text-white/40" : "text-gray-500"
            }`}
          >
            Claude may make mistakes. Please verify important information.
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;
