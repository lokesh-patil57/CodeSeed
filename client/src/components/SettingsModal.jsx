import { useState, useContext } from "react";
import { X, User, Settings, Shield, CreditCard, Bell, Palette, Globe, Download } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const SettingsModal = ({ isOpen, onClose, user }) => {
  const { isDark, setIsDark } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    theme: isDark ? "dark" : "light",
    notifications: true,
    language: "en",
  });

  if (!isOpen) return null;

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  const handleThemeChange = (theme) => {
    setSettings({ ...settings, theme });
    setIsDark(theme === "dark");
    toast.success("Theme updated");
  };

  const handleLogout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const bgMain = isDark ? "#1a1a1a" : "#ffffff";
  const bgSecondary = isDark ? "#141413" : "#f5f5f7";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/70" : "text-gray-600";
  const borderColor = isDark ? "border-white/10" : "border-black/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ backgroundColor: bgMain }}
      >
        {/* Left sidebar - Tabs */}
        <div
          className="w-64 border-r p-4 flex flex-col"
          style={{ backgroundColor: bgSecondary, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Settings</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-black/5 ${textSecondary}`}
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    activeTab === tab.id
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-black/10 text-gray-900"
                      : `${textSecondary} hover:bg-black/5`
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "general" && (
            <div className="space-y-8">
              <div>
                <h3 className={`text-2xl font-semibold mb-2 ${textPrimary}`}>General</h3>
                <p className={textSecondary}>Customize your experience</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Palette size={20} className={textSecondary} />
                    <h4 className={`text-lg font-medium ${textPrimary}`}>Appearance</h4>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`px-6 py-3 rounded-xl border transition ${
                        settings.theme === "light"
                          ? "bg-black text-white border-black"
                          : `${borderColor} ${textSecondary} hover:bg-black/5`
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`px-6 py-3 rounded-xl border transition ${
                        settings.theme === "dark"
                          ? "bg-white text-black border-white"
                          : `${borderColor} ${textSecondary} hover:bg-black/5`
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Bell size={20} className={textSecondary} />
                    <h4 className={`text-lg font-medium ${textPrimary}`}>Notifications</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={textPrimary}>Response completions</p>
                      <p className={`text-sm ${textSecondary}`}>
                        Get notified when AI has finished a response
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      className={`relative w-12 h-6 rounded-full transition ${
                        settings.notifications
                          ? "bg-orange-500"
                          : isDark
                          ? "bg-white/20"
                          : "bg-black/20"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.notifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Globe size={20} className={textSecondary} />
                    <h4 className={`text-lg font-medium ${textPrimary}`}>Language</h4>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border ${borderColor} ${textPrimary} bg-transparent`}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Download size={20} className={textSecondary} />
                    <h4 className={`text-lg font-medium ${textPrimary}`}>Data Export</h4>
                  </div>
                  <button
                    className={`px-6 py-3 rounded-xl border ${borderColor} ${textPrimary} hover:bg-black/5 transition`}
                  >
                    Export all data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-8">
              <div>
                <h3 className={`text-2xl font-semibold mb-2 ${textPrimary}`}>Account</h3>
                <p className={textSecondary}>Manage your account settings</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block mb-2 ${textPrimary}`}>Full name</label>
                  <input
                    type="text"
                    defaultValue={user?.username || ""}
                    className={`w-full px-4 py-2 rounded-xl border ${borderColor} ${textPrimary} bg-transparent`}
                  />
                </div>

                <div>
                  <label className={`block mb-2 ${textPrimary}`}>Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    className={`w-full px-4 py-2 rounded-xl border ${borderColor} ${textPrimary} bg-transparent`}
                  />
                </div>

                <div>
                  <label className={`block mb-2 ${textPrimary}`}>Change Password</label>
                  <button
                    className={`px-6 py-3 rounded-xl border ${borderColor} ${textPrimary} hover:bg-black/5 transition`}
                  >
                    Change password
                  </button>
                </div>

                <div className="pt-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={textPrimary}>Log out of all devices</p>
                      <p className={`text-sm ${textSecondary}`}>Sign out from all devices</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`px-6 py-2 rounded-xl border ${borderColor} ${textPrimary} hover:bg-red-500/10 hover:border-red-500/50 transition`}
                    >
                      Log out
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={textPrimary}>Delete your account</p>
                      <p className={`text-sm ${textSecondary}`}>Permanently delete your account and data</p>
                    </div>
                    <button
                      className={`px-6 py-2 rounded-xl border border-red-500/50 ${textPrimary} hover:bg-red-500/10 transition`}
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-8">
              <div>
                <h3 className={`text-2xl font-semibold mb-2 ${textPrimary}`}>Privacy</h3>
                <p className={textSecondary}>Control your privacy settings</p>
              </div>
              <p className={textSecondary}>Privacy settings coming soon...</p>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              <div>
                <h3 className={`text-2xl font-semibold mb-2 ${textPrimary}`}>Billing</h3>
                <p className={textSecondary}>Manage your subscription</p>
              </div>
              <div className={`p-6 rounded-xl border ${borderColor}`}>
                <p className={`text-lg font-medium mb-2 ${textPrimary}`}>Free Plan</p>
                <p className={textSecondary}>You're currently on the free plan</p>
                <button
                  className="mt-4 px-6 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

