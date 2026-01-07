import React from "react";

const LoadingAnimation = ({ isDark = false }) => {
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";

  return (
    <div className="flex items-start gap-3 mb-6" style={{ animation: "fadeInLoading 0.3s ease-out" }}>
      <div className="flex-1">
        <div
          className={`rounded-lg p-4 ${
            isDark ? "bg-white/5" : "bg-black/5"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Animated dots */}
            <div className="flex gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDark ? "bg-orange-400" : "bg-orange-500"
                }`}
                style={{
                  animation: "bounceLoading 1.4s infinite",
                  animationDelay: "0s",
                }}
              ></div>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDark ? "bg-orange-400" : "bg-orange-500"
                }`}
                style={{
                  animation: "bounceLoading 1.4s infinite",
                  animationDelay: "0.2s",
                }}
              ></div>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDark ? "bg-orange-400" : "bg-orange-500"
                }`}
                style={{
                  animation: "bounceLoading 1.4s infinite",
                  animationDelay: "0.4s",
                }}
              ></div>
            </div>

            {/* Text */}
            <span className={`text-sm font-medium ${textSecondary}`}>
              AI is thinking...
            </span>
          </div>

          {/* Animated underline */}
          <div
            className="h-0.5 mt-2 rounded-full overflow-hidden"
            style={{
              background: isDark
                ? "linear-gradient(90deg, transparent, rgba(255,165,0,0.3), transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,165,0,0.2), transparent)",
            }}
          >
            <div
              style={{
                height: "100%",
                background: isDark
                  ? "linear-gradient(90deg, transparent, rgba(255,165,0,0.6), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(255,165,0,0.5), transparent)",
                animation: "shimmerLoading 1.5s infinite",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes bounceLoading {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-8px);
            opacity: 0.6;
          }
        }

        @keyframes shimmerLoading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fadeInLoading {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
