import React from "react";
import { Sun, Moon, Settings, User, Info, ArrowRight } from "lucide-react";

export default function NavBar({ isDark, toggleTheme, focusEmail }) {
  // shared button classes with theme variants (now driven by props)
  const btnBase = "p-2 rounded-lg transition-colors duration-200";
  const btnHover = isDark ? "hover:bg-white/5" : "hover:bg-black/5";
  const btnText = isDark ? "text-gray-300" : "text-gray-700";

  return (
    // full-width header with glass-morphism + transparent backgrounds for both themes
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-300
        ${
          isDark
            ? "border-b border-neutral-800/50 text-white"
            : "bg-white/20 border-b border-neutral-200/30 text-gray-900"
        }`}
      style={{ backgroundColor: isDark ? "rgba(26, 26, 26, 0.6)" : undefined }}
    >
      <div className="ml-5 mx-auto px-4 sm:px-6 lg:px-8">
        <nav>
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex items-center gap-2 ">
              <img src="./images/logo.png" className={`w-10 filter transition duration-200 ${
                  isDark ? "" : "brightness-0"
                }`}
                alt="Name logo" />
              <img
                src="./images/namelogo.png"
                className={`w-48 filter transition duration-200 ${
                  isDark ? "" : "brightness-0"
                }`}
                alt="Name logo"
              />
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center space-x-2">
              <button
                className={`${btnBase} ${btnHover} ${btnText}`}
                aria-label="About"
                title="About"
              >
                <Info size={20} />
              </button>

              <button
                onClick={toggleTheme}
                className={`${btnBase} ${btnHover} ${btnText}`}
                aria-label="Toggle theme"
                title={isDark ? "Switch to light" : "Switch to dark"}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                className={`${btnBase} ${btnHover} ${btnText}`}
                aria-label="Settings"
                title="Settings"
              >
                <Settings size={20} />
              </button>

              <button
                className={`${btnBase} ${btnHover} ${btnText}`}
                aria-label="User profile"
                title="Profile"
              >
                <User size={20} />
              </button>

              <button
                onClick={focusEmail}
                className={`ml-2 px-3 py-1 rounded-full flex items-center gap-2 text-sm border transition-colors duration-200 ${
                  isDark
                    ? "border-white text-white bg-black hover:bg-white/10"
                    : "border-black text-black bg-white/0 hover:bg-black/5"
                }`}
                aria-label="Start with email"
                title="Start with email"
              >
                <span>Try this</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
