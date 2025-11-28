import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Chat() {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(decoded.email);
      setTimeout(() => setFadeIn(true), 200);
      setTimeout(() => setShowContent(true), 800);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else {
      // Trigger animations
      setTimeout(() => setFadeIn(true), 200);
      setTimeout(() => setShowContent(true), 800);
    }
  }, []);

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white transition-opacity duration-1000 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Welcome Message */}
      

      <div
        className={`text-center transform transition-all duration-1000 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="text-4xl font-light mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-transparent bg-clip-text animate-fade-in">
        👋 Welcome Back, {userEmail.split("@")[0]}!
      </h1>
        <p className="text-neutral-400 text-lg">
          Your AI chat is ready. Start typing below!
        </p>
      </div>

      {/* Chat Box */}
      <div
        className={`mt-10 w-full max-w-2xl flex flex-col h-[60vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-6 transition-all duration-1000 delay-500 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-3 bg-neutral-800 rounded-lg self-start max-w-[75%]">
            <p className="text-sm text-neutral-300">
              Hello! 👋 How can I help you today?
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button className="px-5 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-lg font-medium hover:scale-105 transition-transform">
            Send
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Chat;
